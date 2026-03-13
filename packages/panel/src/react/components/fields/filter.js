"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const select_1 = __importDefault(require("./select"));
function Filter({ icon, label, option }) {
    var state = (0, client_1.useState)({ filter: false });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "tool filter", onClick: () => {
                    state.set({ filter: state.filter ? false : true });
                }, children: [(0, jsx_runtime_1.jsx)("span", { className: "icon", children: (0, jsx_runtime_1.jsx)("i", { className: "icon-filter" }) }), (0, jsx_runtime_1.jsx)("span", { children: "Filters" })] }), state.filter && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(select_1.default, { radio: true, icon: 'wavy-check', label: 'Status', option: ['Draft', 'Published'] }), (0, jsx_runtime_1.jsx)(select_1.default, { radio: true, icon: icon, label: label, option: option })] }))] }));
}
exports.default = Filter;
