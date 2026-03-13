"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const brand_1 = __importDefault(require("../components/brand"));
const checkbox_1 = __importDefault(require("../components/fields/checkbox"));
function default_1({ name }) {
    const state = (0, client_1.useState)({ email: null, password: null });
    const { meta } = (0, client_1.useContext)();
    return ((0, jsx_runtime_1.jsx)("div", { id: "login", children: (0, jsx_runtime_1.jsxs)("form", { className: "box", onSubmit: (e) => {
                e.preventDefault();
                // state.post('auth', {
                //   data: state
                // })
                // .then(({code, message, data: user}) => {
                //   if(code == 200) {
                //     if(user) {
                //       Link.redirect(meta.query.ref ?? '/panel')
                //     }
                //   }
                //   else {
                //     state.set({error: message})
                //   }
                // })
                // .catch((e: any) => console.log(e))
            }, children: [(0, jsx_runtime_1.jsx)(brand_1.default, {}), state.error && ((0, jsx_runtime_1.jsx)("p", { className: "error", children: state.error })), (0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("i", { className: "icon-user" }), (0, jsx_runtime_1.jsx)("span", { children: "Email" })] }), (0, jsx_runtime_1.jsx)("input", { type: "email", onChange: (e) => state.set({ email: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "field", style: { marginBottom: 15 }, children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("i", { className: "icon-lock" }), (0, jsx_runtime_1.jsx)("span", { children: "Password" })] }), (0, jsx_runtime_1.jsx)("input", { type: "password", onChange: (e) => state.set({ password: e.target.value }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex remember", children: (0, jsx_runtime_1.jsx)(checkbox_1.default, { label: 'Remember Me' }) }), (0, jsx_runtime_1.jsx)("div", { className: "action", children: (0, jsx_runtime_1.jsx)("button", { className: "button-1", style: { width: '100%' }, onClick: () => {
                            client_1.Link.redirect('/panel');
                        }, children: "Login" }) })] }) }));
}
exports.default = default_1;
