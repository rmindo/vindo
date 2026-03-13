"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const table_1 = __importDefault(require("../../components/table"));
function default_1({}) {
    return ((0, jsx_runtime_1.jsx)("div", { id: "pages", children: (0, jsx_runtime_1.jsx)(table_1.default, { columns: [
                'ID',
                'Title',
                'Type',
                'Status',
                'Updated',
            ], resource: 'Pages' }) }));
}
exports.default = default_1;
