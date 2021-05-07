"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRemarkAnchor;

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _providers = _interopRequireDefault(require("./providers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createRemarkAnchor(OrigA) {
  var _class, _temp;

  return _temp = _class = class RemarkAnchor extends React.Component {
    render() {
      const [label] = Array.isArray(this.props.children) ? this.props.children : [];

      if (typeof label === "string" && label.startsWith("!Excalidraw")) {
        for (const provider of _providers.default) {
          if (provider.test(this.props.href)) {
            const Component = provider.default;
            return /*#__PURE__*/React.createElement(Component, {
              filePath: this.props.href
            });
          }
        }
      }

      if (OrigA) {
        return /*#__PURE__*/React.createElement(OrigA, this.props, this.props.children);
      } else {
        return /*#__PURE__*/React.createElement("a", this.props, this.props.children);
      }
    }

  }, _defineProperty(_class, "propTypes", {
    href: _propTypes.default.string,
    children: _propTypes.default.node
  }), _temp;
}