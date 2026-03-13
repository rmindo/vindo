"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Check({ checked = false, label, space = 10, onClick }) {
    return ((0, jsx_runtime_1.jsxs)("span", { className: 'checkbox', onClick: () => {
            if (onClick) {
                onClick(checked ? false : true);
            }
        }, children: [(0, jsx_runtime_1.jsx)("span", { className: checked ? 'check checked' : 'check', children: checked && ((0, jsx_runtime_1.jsx)("i", { className: 'icon-check' })) }), label && ((0, jsx_runtime_1.jsx)("span", { className: 'label', style: { marginLeft: space }, children: label }))] }));
}
exports.default = Check;
