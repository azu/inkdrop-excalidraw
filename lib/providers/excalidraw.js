"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.test = test;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _useDebounce = require("use-debounce");

var _reactRedux = require("react-redux");

var _dayjs = _interopRequireDefault(require("dayjs"));

var _reactFullScreen = require("react-full-screen");

var _bs = require("react-icons/bs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function test(filePathOrUrl) {
  if (!filePathOrUrl) {
    return false;
  }

  if (!filePathOrUrl.startsWith("file:")) {
    return false;
  }

  try {
    // support .excalidraw.png and .excalidraw.png?updated=xxx
    return filePathOrUrl.endsWith(".excalidraw") || filePathOrUrl.includes(".excalidraw.png");
  } catch {
    return false;
  }
}

const readExcalidraw = async fileUrl => {
  const filePath = _url.default.fileURLToPath(fileUrl);

  const content = await _fs.default.promises.readFile(filePath, "utf-8");
  return JSON.parse(content);
};
/**
 * @type {import("@excalidraw/excalidraw").exportToBlob | null}
 */


let exportToBlob = null;
/**
 * @type {import("@excalidraw/excalidraw").serializeAsJSON | null}
 */

let serializeAsJSON = null;

const updateNoteExcalidrawWithImage = ({
  filePath,
  fileUrl
}) => {
  /**
   * @type {CodeMirror.Editor}
   */
  const cm = inkdrop.getActiveEditor().cm;
  const text = cm.getValue();
  const updatedText = text // Update timstamp ![Excalidraw](file:///path/to/file.excalidraw.png?updated=timestamp)
  .replace(/(!\[Excalidraw]\((.*\.excalidraw)\.png\?updated=.*?\))/g, (all, link, matchFileUrl) => {
    if (matchFileUrl !== fileUrl) {
      return all; // no change
    }

    const imageFilePath = filePath + ".png";

    if (_fs.default.existsSync(imageFilePath)) {
      const imageFileUrl = fileUrl + ".png";
      const timeStamp = "?updated=" + (0, _dayjs.default)().format("YYYY-MM-DD--HH-mm-ss");
      return `![Excalidraw](${imageFileUrl + timeStamp})`;
    } else {
      return all;
    }
  }) // [!Excalidraw](file:///path/to/file.excalidraw) ??? ![Excalidraw](file:///path/to/file.excalidraw.png?updated=timestamp)
  .replace(/(\[!Excalidraw]\((.*\.excalidraw)\))/g, (all, link, matchFileUrl) => {
    if (matchFileUrl !== fileUrl) {
      return all; // no change
    }

    const imageFilePath = filePath + ".png";

    if (_fs.default.existsSync(imageFilePath)) {
      const timeStamp = "?updated=" + (0, _dayjs.default)().format("YYYY-MM-DD--HH-mm-ss");
      const imageFileUrl = fileUrl + ".png";
      return `![Excalidraw](${imageFileUrl + timeStamp})`;
    } else {
      return all;
    }
  });

  if (text !== updatedText) {
    cm.setValue(updatedText);
  }
};

const writeExcalidraw = async (fileUrl, {
  elements,
  appState
}) => {
  if (!serializeAsJSON) {
    return;
  }

  if (elements.length === 0) {
    return; // does not save when no element
  }

  const filePath = _url.default.fileURLToPath(fileUrl);

  if (!_fs.default.existsSync(filePath)) {
    return;
  }

  if (exportToBlob) {
    const blob = await exportToBlob({
      elements,
      appState
    });
    await new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        _fs.default.promises.writeFile(filePath + ".png", Buffer.from(new Uint8Array(fileReader.result))).then(resolve, reject);
      };

      fileReader.readAsArrayBuffer(blob);
    });
  }

  const serializedData = serializeAsJSON(elements, appState);
  await _fs.default.promises.writeFile(filePath, serializedData, "utf-8");
  const enabledInlineImageWidgets = inkdrop.config.get("excalidraw.inlineImageWidgets");

  if (enabledInlineImageWidgets) {
    updateNoteExcalidrawWithImage({
      filePath,
      fileUrl
    });
  }
};

function ExcalidrawWrapper(props) {
  const excalidrawRef = (0, _react.useRef)(null);
  const [Comp, setComp] = (0, _react.useState)(null);
  const [viewModeEnabled] = (0, _react.useState)(false); // excalidraw call onChange when startup
  // for avoiding hidden updating

  const [updateAtLeastOne, setUpdateAtLeastOne] = (0, _react.useState)(false);
  const [initialData, setInitialData] = (0, _react.useState)(null);
  const [zenModeEnabled] = (0, _react.useState)(false);
  const [gridModeEnabled] = (0, _react.useState)(false);
  const handle = (0, _reactFullScreen.useFullScreenHandle)();
  const onChange = (0, _useDebounce.useDebouncedCallback)((0, _react.useCallback)((elements, appState) => {
    if (!updateAtLeastOne) {
      return;
    }

    writeExcalidraw(props.fileUrl, {
      elements,
      appState
    }).catch(error => {
      console.error("save error on " + props.fileUrl, error);
    });
  }, [excalidrawRef, updateAtLeastOne]), 500);
  const onPointerUpdate = (0, _react.useCallback)(() => {
    setUpdateAtLeastOne(true);
  }, []);
  (0, _react.useEffect)(() => {
    const DEFAULT_STATE = {
      elements: [],
      appState: {
        viewBackgroundColor: "#FFFFFF"
      }
    };

    if (!props.fileUrl.endsWith(".excalidraw")) {
      return setInitialData(DEFAULT_STATE);
    }

    readExcalidraw(props.fileUrl).then(state => setInitialData(state)).catch(error => {
      console.error("parse error on " + props.fileUrl, error);
      setInitialData(DEFAULT_STATE);
    });
    return () => {
      setInitialData(null);
    };
  }, [props.preview.renderId]);
  (0, _react.useEffect)(() => {
    if (!initialData) {
      return;
    } // Load from local to avoid CSP error


    window.EXCALIDRAW_ASSET_PATH = _path.default.join(__dirname, "../../resources") + "/";
    Promise.resolve().then(() => _interopRequireWildcard(require("@excalidraw/excalidraw"))).then(comp => {
      exportToBlob = comp.exportToBlob;
      serializeAsJSON = comp.serializeAsJSON;
      setComp(comp.default);
    });
  }, [initialData]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "inkdrop-excalidraw-container"
  }, Comp && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "inkdrop-excalidraw-toolbar"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: handle.enter,
    className: "inkdrop-excalidraw-fullscreenButton"
  }, /*#__PURE__*/_react.default.createElement(_bs.BsArrowsFullscreen, null))), /*#__PURE__*/_react.default.createElement(_reactFullScreen.FullScreen, {
    handle: handle,
    className: "inkdrop-excalidraw-fullscreen"
  }, /*#__PURE__*/_react.default.createElement(Comp, {
    ref: excalidrawRef,
    initialData: initialData,
    onChange: onChange,
    onPointerUpdate: onPointerUpdate,
    viewModeEnabled: viewModeEnabled,
    zenModeEnabled: zenModeEnabled,
    gridModeEnabled: gridModeEnabled
  }))));
}

ExcalidrawWrapper.prototype.propTypes = {
  fileUrl: _propTypes.default.string,
  preview: _propTypes.default.object
};
const connector = (0, _reactRedux.connect)(({
  preview
}) => ({
  preview
}), dispatch => ({
  dispatch
}));

var _default = connector(ExcalidrawWrapper);

exports.default = _default;