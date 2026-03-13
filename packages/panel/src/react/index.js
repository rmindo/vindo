"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const login_1 = __importDefault(require("./pages/login"));
const pages_1 = __importDefault(require("./pages/pages"));
const posts_1 = __importDefault(require("./pages/posts"));
const editor_1 = __importDefault(require("./pages/editor"));
const settings_1 = __importDefault(require("./pages/settings"));
const dashboard_1 = __importDefault(require("./pages/dashboard"));
const sidebar_1 = __importDefault(require("./components/sidebar"));
function default_1(meta) {
    return ((0, jsx_runtime_1.jsxs)("html", { children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("title", { children: meta.title }), (0, jsx_runtime_1.jsx)("meta", { charSet: "utf-8" }), (0, jsx_runtime_1.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), (0, jsx_runtime_1.jsx)("link", { rel: "stylesheet", href: "/assets/css/panel.css", type: "text/css" }), (0, jsx_runtime_1.jsx)("link", { rel: "stylesheet", href: "/assets/css/editor.css", type: "text/css" })] }), (0, jsx_runtime_1.jsxs)("body", { children: [meta.external && ((0, jsx_runtime_1.jsx)(client_1.Provider, { children: (0, jsx_runtime_1.jsx)(client_1.Content, { children: (0, jsx_runtime_1.jsx)(client_1.View, { name: "login", component: login_1.default }) }) })), !meta.external && ((0, jsx_runtime_1.jsxs)(client_1.Provider, { children: [(0, jsx_runtime_1.jsx)(sidebar_1.default, {}), (0, jsx_runtime_1.jsx)("main", { id: "content", children: (0, jsx_runtime_1.jsxs)(client_1.Content, { children: [(0, jsx_runtime_1.jsx)(client_1.View, { name: "edit", component: editor_1.default }), (0, jsx_runtime_1.jsx)(client_1.View, { name: "posts", component: posts_1.default }), (0, jsx_runtime_1.jsx)(client_1.View, { name: "pages", component: pages_1.default }), (0, jsx_runtime_1.jsx)(client_1.View, { name: "panel", component: dashboard_1.default }), (0, jsx_runtime_1.jsx)(client_1.View, { name: "settings", component: settings_1.default })] }) })] }))] })] }));
}
exports.default = default_1;
