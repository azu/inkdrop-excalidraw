"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLocal = void 0;
const isLocal = location.protocol === "file:";
exports.isLocal = isLocal;