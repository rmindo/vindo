"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@vindo/react/client");
/**
 * Components
 */
const button_1 = __importDefault(require("../fields/button"));
const popup_1 = __importDefault(require("../../components/popup"));
/**
 * Save post or page base on resource type provided
 * @param params
 * @returns {ReactElement}
 */
function Save({ data, method, saved, plain, resource }) {
    const state = (0, client_1.useState)({
        notify: null,
        saving: false,
        publishing: false
    });
    const save = (status, saving) => {
        state.set(saving);
        // const path = resource.toLowerCase()
        // http[method](path, {
        //   data: {
        //     ...data,
        //     status
        //   }
        // })
        // .then(({code, data, message}: HTTPResponse & {data: PageInterface | PostInterface}) => {
        //   if(data) {
        //     if(code == 200) {
        //       if(saved) {
        //         saved(data)
        //         state.set({saving: false, publishing: false})
        //       }
        //     }
        //     if(code == 201) {
        //       Link.redirect(`/panel/${path}/edit/${data.id}`)
        //     }
        //   }
        //   state.set({
        //     notify: message,
        //     status: code
        //   })
        // })
        // .finally(() => {
        //   setTimeout(() => {
        //     state.set({notify: null, saving: false, publishing: false})
        //   }, 3000)
        // })
        // .catch((e: any) => console.log(e))
    };
    if (plain) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: `save ${data?.status == 'Draft' ? 'blur' : ''}`, onClick: () => {
                        if (data?.status == 'Published') {
                            save('Draft', { saving: true });
                        }
                    }, children: state.saving ? 'Moving...' : 'Move to Draft' }), (0, jsx_runtime_1.jsx)(popup_1.default, { notify: state.notify, status: state.status })] }));
    }
    else {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "save action", children: [(0, jsx_runtime_1.jsx)(button_1.default, { type: 2, icon: 'plane-slope', label: 'Publish', loading: state.publishing, onClick: () => {
                        save('Published', { publishing: true });
                    }, style: {
                        opacity: data?.status == 'Published' ? 0.4 : 1
                    }, disabled: data?.status == 'Published' }), (0, jsx_runtime_1.jsx)(button_1.default, { type: 1, icon: 'save', loading: state.saving, onClick: () => {
                        save(data?.id ? data.status : 'Draft', { saving: true });
                    }, label: data?.id ? 'Update' : 'Save as Draft' }), (0, jsx_runtime_1.jsx)(popup_1.default, { notify: state.notify, status: state.status })] }));
    }
}
exports.default = Save;
