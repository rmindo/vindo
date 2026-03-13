/*
 * @vindo/panel
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = void 0;
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@vindo/static"));
const cwd = process.cwd();
function serve(app) {
    const name = 'panel';
    const panel = 'node_modules/@vindo/panel/';
    app.use(function (req, res, next, { vindo }) {
        req.root = vindo.root;
        if (req.startsWith(name)) {
            req.root = path_1.default.resolve(cwd, panel, ...req.root).split('/');
        }
        app.start(req, res);
        next();
    });
    app.use(static_1.default.serve(panel.concat('public')));
}
exports.serve = serve;
