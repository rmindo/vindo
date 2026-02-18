"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = button;
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
function button() {
    const state = (0, client_1.useState)({ count: 1 });
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => {
            state.set({ count: state.count + 1 });
        }, children: ["Count ", state.count] }));
}
