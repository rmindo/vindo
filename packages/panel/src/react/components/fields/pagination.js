"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
function Pagination() {
    var state = (0, client_1.useState)({ page: 1 });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "pagination", children: [(0, jsx_runtime_1.jsx)("span", { className: "back", onClick: () => {
                    state.set({ back: true });
                }, children: (0, jsx_runtime_1.jsx)("i", { className: "icon-caret-left" }) }), (0, jsx_runtime_1.jsx)("span", { className: "number", children: "1" }), (0, jsx_runtime_1.jsx)("span", { onClick: () => {
                    state.set({ next: true });
                }, children: (0, jsx_runtime_1.jsx)("i", { className: "icon-caret-right" }) })] }));
}
exports.default = Pagination;
