"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
/**
 * Export images
 */
function Select({ width, value, icon, radio, label, option, onChange, disabled = false }) {
    var state = (0, client_1.useState)({ value: null, selecting: false });
    var isFlatSelectionOptions = true;
    /**
     * options = [{id: 123, value: 'string representation'}]
     */
    if (option?.length > 0 && option[0].id !== undefined) {
        isFlatSelectionOptions = false;
    }
    // React.useEffect(() => {
    //   state.set({value})
    // }, [value])
    return ((0, jsx_runtime_1.jsxs)("div", { className: "select", children: [(0, jsx_runtime_1.jsxs)("button", { disabled: disabled, style: {
                    width: width ? width.select : 'auto'
                }, onClick: () => {
                    state.set({ selecting: state.selecting ? false : true });
                }, children: [(0, jsx_runtime_1.jsxs)("span", { className: "text", children: [(0, jsx_runtime_1.jsx)("i", { className: `icon icon-${icon}` }), (0, jsx_runtime_1.jsx)("span", { children: value ? value : state.value ? state.value : label })] }), (0, jsx_runtime_1.jsx)("i", { className: "caret icon-caret-down" })] }), state.selecting && ((0, jsx_runtime_1.jsx)("div", { className: "option", style: {
                    width: width ? width.option : 'auto'
                }, children: (option?.length > 0) && option?.map((item, key) => ((0, jsx_runtime_1.jsxs)("span", { className: state.value == item ? 'value selected' : 'value', onClick: () => {
                        if (onChange) {
                            onChange(item);
                        }
                        state.set({
                            selecting: false,
                            value: isFlatSelectionOptions ? item : item.value
                        });
                    }, children: [radio && ((0, jsx_runtime_1.jsx)("span", { className: "radio" })), (0, jsx_runtime_1.jsx)("span", { className: "text", children: isFlatSelectionOptions ? item : item.value })] }, key))) }))] }));
}
exports.default = Select;
