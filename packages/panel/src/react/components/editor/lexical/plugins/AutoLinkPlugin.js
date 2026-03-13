"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const LexicalAutoLinkPlugin_1 = require("@lexical/react/LexicalAutoLinkPlugin");
const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
const MATCHERS = [
    (text) => {
        const match = URL_MATCHER.exec(text);
        return (match && {
            index: match.index,
            length: match[0].length,
            text: match[0],
            url: match[0]
        });
    },
    (text) => {
        const match = EMAIL_MATCHER.exec(text);
        return (match && {
            index: match.index,
            length: match[0].length,
            text: match[0],
            url: `mailto:${match[0]}`
        });
    }
];
function PlaygroundAutoLinkPlugin() {
    return (0, jsx_runtime_1.jsx)(LexicalAutoLinkPlugin_1.AutoLinkPlugin, { matchers: MATCHERS });
}
exports.default = PlaygroundAutoLinkPlugin;
