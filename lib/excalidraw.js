"use strict";

var _remarkAnchor = _interopRequireDefault(require("./remark-anchor"));

var _inkdrop = require("inkdrop");

var _eventKit = require("event-kit");

var _fs = _interopRequireDefault(require("fs"));

var _url = _interopRequireDefault(require("url"));

var _path = _interopRequireDefault(require("path"));

var _dayjs = _interopRequireDefault(require("dayjs"));

var _remarkImg = _interopRequireDefault(require("./remark-img"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const insertText = text => {
  const cm = inkdrop.getActiveEditor().cm;
  cm.replaceSelection(text + "\n");
};
/**
 * Create new .excalidraw file and return file:/// url
 * @param dirPath
 * @returns {URL}
 */


const createExcalidraw = dirPath => {
  const DEFAULT_STATE = {
    type: "excalidraw",
    version: 2,
    source: "file://",
    elements: [],
    appState: {
      viewBackgroundColor: "#FFFFFF"
    }
  };

  if (!dirPath) {
    throw new Error("Please set dirPath");
  }

  const filePath = _path.default.join(dirPath, (0, _dayjs.default)().format("YYYY-MM-DD--HH-mm-ss") + ".excalidraw");

  _fs.default.writeFileSync(filePath, JSON.stringify(DEFAULT_STATE), "utf-8");

  return _url.default.pathToFileURL(filePath);
};

const subscriptions = new _eventKit.CompositeDisposable();
module.exports = {
  origAComponent: null,
  config: {
    saveDir: {
      title: "A saving directory for .excalidraw files",
      description: "Put the path to directory for savind .excalidraw files",
      type: "string",
      default: ""
    },
    inlineImageWidgets: {
      title: "Enable integration for inline image widgets",
      description: "If it is enabled, prefer to use image tag instead of link to .excalidraw",
      type: "boolean",
      default: false
    }
  },

  activate() {
    if (_inkdrop.markdownRenderer) {
      this.setupLinkComponent();
    }

    subscriptions.add(inkdrop.commands.add(document.body, {
      "excalidraw:create": () => {
        const saveDir = inkdrop.config.get("excalidraw.saveDir");

        if (!saveDir) {
          return alert("Please set saveDir of excalidraw plugin");
        }

        const outputFilePath = createExcalidraw(saveDir);
        insertText(`[!Excalidraw](${outputFilePath})`);
      }
    }));
  },

  deactivate() {
    if (_inkdrop.markdownRenderer) {
      this.unsetLinkComponent();
    }

    subscriptions.dispose();
  },

  setupLinkComponent() {
    const OrigA = _inkdrop.markdownRenderer.remarkReactComponents.a;
    _inkdrop.markdownRenderer.remarkReactComponents.a = (0, _remarkAnchor.default)(OrigA);
    this.origAComponent = OrigA;
    const OrigImg = _inkdrop.markdownRenderer.remarkReactComponents.img;
    _inkdrop.markdownRenderer.remarkReactComponents.img = (0, _remarkImg.default)(OrigA);
    this.orgImgComponent = OrigImg;
  },

  unsetLinkComponent() {
    _inkdrop.markdownRenderer.remarkReactComponents.a = this.origAComponent;
    _inkdrop.markdownRenderer.remarkReactComponents.img = this.orgImgComponent;
  }

};