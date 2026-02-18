"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const button_1 = __importDefault(require("../components/button"));
function default_1({}) {
    return ((0, jsx_runtime_1.jsxs)("div", { id: "panel", className: "inner", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Welcome to Admin" }), (0, jsx_runtime_1.jsx)(button_1.default, {}), (0, jsx_runtime_1.jsx)("button", { children: (0, jsx_runtime_1.jsx)(client_1.Link, { href: "/panel/login", children: "Logout" }) })] }));
}
