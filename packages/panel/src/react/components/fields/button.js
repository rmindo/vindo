"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Button({ spinner = 'cog', ...props }) {
    return ((0, jsx_runtime_1.jsxs)("button", { style: props.style, disabled: props.disabled, className: `button-${props.type}`, onClick: () => {
            props.onClick();
        }, children: [props.loading ? ((0, jsx_runtime_1.jsx)("span", { className: "spinner", children: (0, jsx_runtime_1.jsx)("i", { className: `icon-${spinner}` }) })) : ((0, jsx_runtime_1.jsx)("i", { className: `icon-${props.icon}` })), (0, jsx_runtime_1.jsx)("span", { children: props.label })] }));
}
exports.default = Button;
