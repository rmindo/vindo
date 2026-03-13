"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const editor_1 = __importDefault(require("../../components/editor"));
function getPost() {
    return {};
}
function default_1({ params: { id } }) {
    const post = getPost();
    return ((0, jsx_runtime_1.jsx)(editor_1.default, { data: post, action: 'Edit', resource: 'Posts' }));
}
exports.default = default_1;
