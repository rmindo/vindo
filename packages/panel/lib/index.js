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
exports.Panel = void 0;
exports.serve = serve;
const panel_1 = __importDefault(require("./app/pages/panel"));
exports.Panel = panel_1.default;
function serve(http) {
    http.stack.push(function (req, res, next, ctx) {
        req.root = ['src', 'theme', 'ruel', 'http'];
        http.start(req, res);
        if (req.route.segments[0] == 'panel') {
            req.route.path = ctx.file.path.resolve(process.cwd(), 'node_modules/@vindo/panel/lib/app/routes.js');
        }
        next();
    });
}
