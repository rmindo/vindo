"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const posts_1 = __importDefault(require("../../../react/pages/posts"));
function default_1({ meta }) {
    meta.title = 'Posts';
    meta.bundle = true;
    return ((0, jsx_runtime_1.jsx)(posts_1.default, { name: "posts" }));
}
exports.default = default_1;
