"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const save_1 = __importDefault(require("./save"));
const lexical_1 = __importDefault(require("./lexical"));
const select_1 = __importDefault(require("../fields/select"));
const checkbox_1 = __importDefault(require("../fields/checkbox"));
const common_1 = require("../../../lib/common");
function default_1({ data, resource, action }) {
    const state = (0, client_1.useState)(data);
    const descriptionLimit = 20;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("header", { children: (0, jsx_runtime_1.jsxs)("div", { className: "top", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "back", children: (0, jsx_runtime_1.jsxs)("span", { onClick: () => {
                                            client_1.Link.back();
                                        }, children: [(0, jsx_runtime_1.jsx)("i", { className: "icon-arrow-left" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }) }), (0, jsx_runtime_1.jsxs)("h2", { children: [action, " ", resource.slice(0, -1)] })] }), (0, jsx_runtime_1.jsx)("div", { className: "action", children: (0, jsx_runtime_1.jsx)(save_1.default, { data: state, resource: resource, saved: (data) => {
                                    state.set(data);
                                }, method: action == 'Edit' ? 'put' : 'post' }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "create", children: [(0, jsx_runtime_1.jsx)("div", { className: "left", children: (0, jsx_runtime_1.jsx)("div", { className: "editor", children: (0, jsx_runtime_1.jsx)(lexical_1.default, { initialTitle: state.title, initialContent: state.content, onContentChange: ({ title, content, description }) => {
                                    if (state.description) {
                                        description = state.description;
                                    }
                                    else {
                                        description = (0, common_1.sliceWords)(description);
                                    }
                                    state.set({
                                        title,
                                        content,
                                        description,
                                        slug: title && (0, common_1.toPath)(title),
                                    });
                                } }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "right", children: [(0, jsx_runtime_1.jsx)("fieldset", { children: (0, jsx_runtime_1.jsxs)("div", { className: "field information", children: [(0, jsx_runtime_1.jsx)("label", { children: "Information" }), state.status && ((0, jsx_runtime_1.jsxs)("div", { className: "info", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Status" }), (0, jsx_runtime_1.jsx)("span", { className: `text ${state.status.toLowerCase()}`, children: state.status }), (0, jsx_runtime_1.jsx)(save_1.default, { data: state, plain: true, resource: resource, saved: (data) => {
                                                        state.set(data);
                                                    }, method: 'put' })] })), state.user && ((0, jsx_runtime_1.jsxs)("div", { className: "info", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Author" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: state.user.name })] })), action == 'Edit' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [state.created && ((0, jsx_runtime_1.jsxs)("div", { className: "info", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Created" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: (0, common_1.datetime)(state.created).getFullDateTime() })] })), state.updated && ((0, jsx_runtime_1.jsxs)("div", { className: "info", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Updated" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: (0, common_1.datetime)(state.updated).getFullDateTime() })] }))] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "info", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Date" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: (0, common_1.datetime)(Date.now()).getFullDateTime('-') })] }))] }) }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [resource == 'Pages' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsx)("label", { children: "Menu Location" }), (0, jsx_runtime_1.jsxs)("div", { className: "checkboxes inline", children: [(0, jsx_runtime_1.jsx)(checkbox_1.default, { label: 'Top', space: 10, onClick: (checked) => state.set({ topMenu: checked }), checked: state.topMenu }), (0, jsx_runtime_1.jsx)(checkbox_1.default, { label: 'Bottom', space: 10, onClick: (checked) => state.set({ bottomMenu: checked }), checked: state.bottomMenu }), (0, jsx_runtime_1.jsx)("span", {})] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsx)("label", { children: "Page Type" }), (0, jsx_runtime_1.jsx)(select_1.default, { radio: true, value: state.type, width: {
                                                            select: '100%',
                                                            option: '90%'
                                                        }, onChange: (item) => {
                                                            state.set({ type: item });
                                                        }, icon: 'paper', label: 'Select', option: ['Page', 'Category'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsx)("label", { children: "Page Template" }), (0, jsx_runtime_1.jsx)(select_1.default, { radio: true, value: state.template, width: {
                                                            select: '100%',
                                                            option: '90%'
                                                        }, onChange: (item) => {
                                                            state.set({ template: item });
                                                        }, icon: 'paper', label: 'Select', option: ['category'] })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsx)("label", { children: "Category" }), (0, jsx_runtime_1.jsx)(select_1.default, { radio: true, value: state.categories.join(', '), width: {
                                                            option: '90%',
                                                            select: '100%',
                                                        }, onChange: (item) => {
                                                            state.set(({ parent, categories }) => {
                                                                /**
                                                                 * Page is a primary category
                                                                 */
                                                                if (!parent) {
                                                                    parent = item;
                                                                }
                                                                if (!categories.includes(item)) {
                                                                    categories.push(item);
                                                                }
                                                                return { parent, categories };
                                                            });
                                                        }, icon: 'paper', label: 'Select', option: ['Code', 'Network', 'Security', 'Technology'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsx)("label", { children: "Tags" }), (0, jsx_runtime_1.jsx)(select_1.default, { radio: true, value: state.tags, width: {
                                                            option: '90%',
                                                            select: '100%',
                                                        }, onChange: (item) => {
                                                            state.set({ tags: item });
                                                        }, icon: 'paper', label: 'Select', option: ['Code', 'Network', 'Security', 'Technology'] })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsx)("label", { children: "Description" }), (0, jsx_runtime_1.jsx)("textarea", { id: "description", onChange: (e) => {
                                                    state.set({ description: (0, common_1.sliceWords)(e.target.value) });
                                                }, value: state.description }), (0, jsx_runtime_1.jsxs)("span", { className: "text", children: [descriptionLimit, " words limit."] })] })] })] })] })] }));
}
exports.default = default_1;
