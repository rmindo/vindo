"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const editor_1 = __importDefault(require("../../../react/pages/editor"));
function default_1({ meta }) {
    meta.title = 'Create Page';
    meta.bundle = true;
    const initial = {
        user: {},
        tags: [],
        author: 1,
        categories: []
    };
    return ((0, jsx_runtime_1.jsx)(editor_1.default, { name: 'edit', data: initial, action: 'Create', resource: 'Pages' }));
}
exports.default = default_1;
