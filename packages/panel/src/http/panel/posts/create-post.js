"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const edit_1 = __importDefault(require("../../../react/pages/posts/edit"));
function default_1({ meta }) {
    meta.title = 'Edit Post';
    meta.bundle = true;
    return ((0, jsx_runtime_1.jsx)(edit_1.default, { name: "create-post" }));
}
exports.default = default_1;
