"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
function Search() {
    var input = null;
    var state = (0, client_1.useState)({ keyword: '' });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "tool search", children: [(0, jsx_runtime_1.jsx)("span", { children: (0, jsx_runtime_1.jsx)("input", { type: "text", ref: (ref) => {
                        input = ref;
                    }, onChange: (e) => {
                        state.set({ keyword: e.target.value });
                    } }) }), (0, jsx_runtime_1.jsx)("span", { className: "icon", onClick: () => {
                    input.focus();
                }, children: (0, jsx_runtime_1.jsx)("i", { className: "icon-search" }) })] }));
}
exports.default = Search;
