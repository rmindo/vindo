"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
function Radio() {
    var state = (0, client_1.useState)({ check: false });
    return ((0, jsx_runtime_1.jsx)("span", { className: state.check ? 'radio checked' : 'radio', onClick: () => {
            state.set({ check: state.check ? false : true });
        }, children: state.check && ((0, jsx_runtime_1.jsx)("i", { className: 'icon-check' })) }));
}
exports.default = Radio;
