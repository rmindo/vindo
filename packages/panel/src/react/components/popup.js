"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Get status from code
 * @param code Status code
 */
function getStatus(code) {
    if (code.toString().match(/^2/g)) {
        return 'success';
    }
    return 'error';
}
/**
 * Popup message either success or error
 */
function PopupMessage({ status, notify }) {
    if (notify) {
        return (0, jsx_runtime_1.jsx)("div", { className: `popup ${getStatus(status)}`, children: notify });
    }
    return null;
}
exports.default = PopupMessage;
