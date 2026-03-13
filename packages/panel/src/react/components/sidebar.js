"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const brand_1 = __importDefault(require("./brand"));
const navigation_json_1 = __importDefault(require("../../navigation.json"));
const common_1 = require("../../lib/common");
function Sidebar() {
    const { meta } = (0, client_1.useContext)();
    return ((0, jsx_runtime_1.jsxs)("aside", { id: "panel", children: [(0, jsx_runtime_1.jsx)(brand_1.default, {}), (0, jsx_runtime_1.jsx)("div", { id: "menu", children: (0, jsx_runtime_1.jsxs)("ul", { children: [navigation_json_1.default.map((item, index) => {
                            return ((0, jsx_runtime_1.jsx)("li", { className: (0, common_1.isActive)(item, meta.name), children: item.label ? ((0, jsx_runtime_1.jsx)("label", { children: item.label })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: item.group ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(client_1.Link, { href: (0, common_1.makePath)(item), children: [(0, jsx_runtime_1.jsx)("i", { className: `icon-${item.icon}` }), (0, jsx_runtime_1.jsx)("span", { children: item.name })] }), item.name?.toLowerCase() === meta.name && ((0, jsx_runtime_1.jsx)("ul", { children: item.group.map((sub, key) => ((0, jsx_runtime_1.jsx)("li", { className: (0, common_1.isActive)(sub, meta.name), children: (0, jsx_runtime_1.jsx)(client_1.Link, { href: (0, common_1.makePath)(item), children: sub?.name }) }, key))) }))] })) : ((0, jsx_runtime_1.jsxs)(client_1.Link, { href: (0, common_1.makePath)(item), children: [(0, jsx_runtime_1.jsx)("i", { className: `icon-${item.icon}` }), (0, jsx_runtime_1.jsx)("span", { children: item.name })] })) })) }, index));
                        }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)("a", { href: "/panel/login", children: [(0, jsx_runtime_1.jsx)("i", { className: "icon-lock" }), (0, jsx_runtime_1.jsx)("span", { children: "Logout" })] }) })] }) })] }));
}
exports.default = Sidebar;
