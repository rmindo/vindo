"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const theme_1 = __importDefault(require("./theme"));
const lexical_1 = require("lexical");
const link_1 = require("@lexical/link");
const list_1 = require("@lexical/list");
const rich_text_1 = require("@lexical/rich-text");
const code_1 = require("@lexical/code");
const table_1 = require("@lexical/table");
exports.default = {
    theme: theme_1.default,
    namespace: 'vindo',
    nodes: [
        lexical_1.TextNode,
        list_1.ListNode,
        code_1.CodeNode,
        link_1.LinkNode,
        rich_text_1.QuoteNode,
        table_1.TableNode,
        rich_text_1.HeadingNode,
        list_1.ListItemNode,
        link_1.AutoLinkNode,
        table_1.TableRowNode,
        lexical_1.ParagraphNode,
        table_1.TableCellNode,
        code_1.CodeHighlightNode,
    ],
    onError(e) {
        throw e;
    }
};
