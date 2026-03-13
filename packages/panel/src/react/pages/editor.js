"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const editor_1 = __importDefault(require("../components/editor"));
function default_1({ data, action, resource }) {
    return ((0, jsx_runtime_1.jsx)(editor_1.default, { data: data, action: action, resource: resource }));
}
exports.default = default_1;
