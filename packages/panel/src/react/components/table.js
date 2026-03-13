"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
const search_1 = __importDefault(require("./fields/search"));
const filter_1 = __importDefault(require("./fields/filter"));
const select_1 = __importDefault(require("./fields/select"));
const checkbox_1 = __importDefault(require("./fields/checkbox"));
const pagination_1 = __importDefault(require("./fields/pagination"));
const common_1 = require("../../lib/common");
/**
 * Prompt message
 */
const confirmDelete = (ids) => {
    return confirm(`You're about to delete the post with ID "${ids.join(', ')}". Please confirm before deleting it.`);
};
function Table({ columns, resource }) {
    const state = (0, client_1.useState)({
        ids: [],
        items: [],
        limit: 10,
        columns,
        status: null,
        notify: null,
        loading: true,
    });
    // React.useEffect(() => {
    // state.get(resource.toLowerCase())
    // .then(({code, data}) => {
    //   if(code == 200) {
    //     state.set({items: data, loading: false})
    //   }
    // })
    // .then((e: any) => console.log(e))
    // }, [])
    const remove = (ids = []) => {
        const ok = confirmDelete(ids);
        if (ok) {
            state.get(resource.toLowerCase(), {
                query: {
                    ids: ids.join(',')
                }
            })
                .then(({ code, message }) => {
                state.set(({ items }) => {
                    if (code == 200) {
                        items = items.filter((item) => !ids.includes(item.id));
                    }
                    return { items, notify: message, status: code };
                });
            })
                .finally(() => {
                setTimeout(() => {
                    state.set({ notify: null, status: null });
                }, 3000);
            })
                .then((e) => console.log(e));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "top", children: [(0, jsx_runtime_1.jsx)("h2", { children: resource }), (0, jsx_runtime_1.jsx)("div", { className: "action", children: (0, jsx_runtime_1.jsxs)("button", { className: "button-1", onClick: () => {
                                        client_1.Link.redirect(`/panel/${resource.toLowerCase()}/create`);
                                    }, children: [(0, jsx_runtime_1.jsx)("i", { className: "icon-edit" }), (0, jsx_runtime_1.jsxs)("span", { children: ["Create ", resource.slice(0, -1)] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bottom", children: [(0, jsx_runtime_1.jsxs)("div", { className: "left", children: [(0, jsx_runtime_1.jsx)(search_1.default, {}), (0, jsx_runtime_1.jsx)(filter_1.default, { icon: 'grid', label: 'Category', option: ['Code', 'Security', 'Network', 'Technology'] }), state.ids.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "tool delete", onClick: () => remove(state.ids), children: [(0, jsx_runtime_1.jsx)("span", { className: "icon", children: (0, jsx_runtime_1.jsx)("i", { className: "icon-bin" }) }), (0, jsx_runtime_1.jsxs)("span", { children: ["Delete (", state.ids.length, ")"] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "right", children: [(0, jsx_runtime_1.jsx)(select_1.default, { radio: true, icon: 'sort', label: 'Sort', onChange: (val) => {
                                        }, option: ['Ascending', 'Descending'] }), (0, jsx_runtime_1.jsx)(select_1.default, { radio: true, icon: 'column', label: 'Column Views', onChange: (val) => {
                                            state.set({ columns: [] });
                                        }, option: [
                                            'ID',
                                            'Title',
                                            'Status',
                                            'Author',
                                            'Category',
                                            'Created',
                                            'Updated',
                                            'Published',
                                            'Description',
                                        ] })] })] })] }), (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [state.columns.map((name, key) => {
                                    return ((0, jsx_runtime_1.jsx)("th", { children: name == 'ID' ? ((0, jsx_runtime_1.jsx)(checkbox_1.default, { label: 'ID', space: 30, onClick: (checked) => {
                                                state.set({
                                                    ids: state.items.reduce((items, item) => {
                                                        if (checked) {
                                                            items.push(item.id);
                                                        }
                                                        else {
                                                            return items.filter((v) => v !== item.id);
                                                        }
                                                        return items;
                                                    }, [])
                                                });
                                            }, checked: state.ids.length > 0 ? true : false })) : ((0, jsx_runtime_1.jsx)("span", { children: name })) }, key));
                                }), (0, jsx_runtime_1.jsx)("th", {})] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: state.loading ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 6, children: (0, jsx_runtime_1.jsx)("span", { className: "spinner", children: (0, jsx_runtime_1.jsx)("i", { className: "icon-cog" }) }) }) })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: state.items.length > 0 ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: state.items.slice(0, state.limit).map((item, key) => {
                                    const editorPath = (0, common_1.createPath)(['panel', resource, 'edit', item.id]);
                                    const publicPath = (0, common_1.createPath)([item.page ? item.page.slug : '', item.slug]);
                                    return ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)(checkbox_1.default, { space: 30, label: item.id, onClick: (checked) => {
                                                        state.set(({ ids }) => {
                                                            if (checked) {
                                                                ids.push(item.id);
                                                            }
                                                            else {
                                                                ids = ids.filter((v) => v !== item.id);
                                                            }
                                                            return { ids };
                                                        });
                                                    }, checked: state.ids.includes(item.id) }) }), (0, jsx_runtime_1.jsx)("td", { className: "title", children: (0, jsx_runtime_1.jsx)(client_1.Link, { href: editorPath, children: item.title }) }), (0, jsx_runtime_1.jsx)("td", { children: item.type }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsxs)("span", { className: `icon ${item.status.toLowerCase()}`, children: [item.status == 'Published' ? ((0, jsx_runtime_1.jsx)("i", { className: "icon-wavy-check" })) : ((0, jsx_runtime_1.jsx)("i", { className: "icon-edit" })), item.status] }) }), (0, jsx_runtime_1.jsx)("td", { children: (0, common_1.datetime)(item.updated).getDateTime() }), (0, jsx_runtime_1.jsxs)("td", { className: "action", children: [(0, jsx_runtime_1.jsx)("span", { className: "icon", children: (0, jsx_runtime_1.jsx)(client_1.Link, { target: "_blank", href: publicPath, children: (0, jsx_runtime_1.jsx)("i", { className: "icon-eye-open" }) }) }), (0, jsx_runtime_1.jsx)("span", { className: "icon", children: (0, jsx_runtime_1.jsx)(client_1.Link, { href: editorPath, children: (0, jsx_runtime_1.jsx)("i", { className: "icon-edit" }) }) }), (0, jsx_runtime_1.jsx)("span", { className: "icon", onClick: () => remove([item.id]), children: (0, jsx_runtime_1.jsx)("i", { className: "icon-bin" }) })] })] }, key));
                                }) })) : ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 7, style: { textAlign: 'center', lineHeight: '22px' }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 14, color: '#999' }, children: "No Entries" }) }) })) })) })] }), (0, jsx_runtime_1.jsxs)("footer", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "limit", children: [(0, jsx_runtime_1.jsx)(select_1.default, { label: state.limit, onChange: (val) => {
                                    state.set({ limit: val });
                                }, option: [5, 10, 20, 30, 40, 50] }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: "Posts per page" })] }), (0, jsx_runtime_1.jsx)("div", { className: "page", children: (0, jsx_runtime_1.jsx)(pagination_1.default, {}) })] })] }));
}
exports.default = Table;
