"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.panel = panel;
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const panel_1 = __importDefault(require("./pages/panel"));
function login(req, res, { meta, state }) {
    meta.ads = false;
    meta.title = 'Login Panel';
    state.use({ count: 1 });
    return ((0, jsx_runtime_1.jsxs)("div", { id: "login", className: "inner", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Login" }), (state.count >= 5 && state.count <= 10) && ((0, jsx_runtime_1.jsx)("p", { children: "Welcome to cointotal" })), (0, jsx_runtime_1.jsxs)("button", { onClick: (e) => {
                    state.set({ count: state.count + 1 });
                }, children: ["Count ", state.count] }), (0, jsx_runtime_1.jsx)("button", { children: (0, jsx_runtime_1.jsx)(client_1.Link, { href: "/panel", children: "Go to Panel" }) })] }));
}
function panel(req, res, { meta, state }) {
    meta.ads = false;
    meta.title = 'Admin Panel';
    return ((0, jsx_runtime_1.jsx)(panel_1.default, { name: 'panel' }));
}
