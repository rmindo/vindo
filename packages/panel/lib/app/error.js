"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Types
 */
function default_1({ meta, error }) {
    meta.title = `${error.statusCode} ${error.status}`;
    return ((0, jsx_runtime_1.jsx)("div", { id: "error", className: "inner", children: (0, jsx_runtime_1.jsxs)("div", { className: "error-404", children: [(0, jsx_runtime_1.jsx)("h1", { children: error.statusCode }), error.data ? ((0, jsx_runtime_1.jsx)("p", { children: error.data.message })) : ((0, jsx_runtime_1.jsx)("p", { children: "Sorry, There's nothing here. The page you're trying to access might be removed, renamed or never exist." }))] }) }));
}
