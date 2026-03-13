"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = exports.login = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const login_1 = __importDefault(require("../../react/pages/login"));
const settings_1 = __importDefault(require("../../react/pages/settings"));
const dashboard_1 = __importDefault(require("../../react/pages/dashboard"));
function login(req, res, { meta }) {
    meta.title = 'Login';
    meta.bundle = true;
    meta.external = true;
    return ((0, jsx_runtime_1.jsx)(login_1.default, { name: "login" }));
}
exports.login = login;
function settings(req, res, { meta }) {
    meta.title = 'Settings';
    meta.bundle = true;
    return ((0, jsx_runtime_1.jsx)(settings_1.default, { name: "settings" }));
}
exports.settings = settings;
function default_1({ meta }) {
    meta.title = 'Panel';
    meta.bundle = true;
    return ((0, jsx_runtime_1.jsx)(dashboard_1.default, { name: "panel" }));
}
exports.default = default_1;
