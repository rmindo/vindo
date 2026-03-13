"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const pages_1 = __importDefault(require("../../../react/pages/pages"));
function default_1({ meta }) {
    meta.title = 'Pages';
    meta.bundle = true;
    return ((0, jsx_runtime_1.jsx)(pages_1.default, { name: "pages" }));
}
exports.default = default_1;
