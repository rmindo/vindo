"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const config_1 = __importDefault(require("./config"));
const markdown_1 = require("@lexical/markdown");
const LexicalLinkPlugin_1 = require("@lexical/react/LexicalLinkPlugin");
const LexicalListPlugin_1 = require("@lexical/react/LexicalListPlugin");
const LexicalComposer_1 = require("@lexical/react/LexicalComposer");
const LexicalHistoryPlugin_1 = require("@lexical/react/LexicalHistoryPlugin");
const LexicalRichTextPlugin_1 = require("@lexical/react/LexicalRichTextPlugin");
const LexicalContentEditable_1 = require("@lexical/react/LexicalContentEditable");
const LexicalAutoFocusPlugin_1 = require("@lexical/react/LexicalAutoFocusPlugin");
const LexicalErrorBoundary_1 = require("@lexical/react/LexicalErrorBoundary");
const LexicalMarkdownShortcutPlugin_1 = require("@lexical/react/LexicalMarkdownShortcutPlugin");
const ToolbarPlugin_1 = __importDefault(require("./plugins/ToolbarPlugin"));
const AutoLinkPlugin_1 = __importDefault(require("./plugins/AutoLinkPlugin"));
const CodeHighlightPlugin_1 = __importDefault(require("./plugins/CodeHighlightPlugin"));
const ListMaxIndentLevelPlugin_1 = __importDefault(require("./plugins/ListMaxIndentLevelPlugin"));
const EditorContentPlugin_1 = require("./plugins/EditorContentPlugin");
function Editor({ initialTitle, initialContent, onContentChange }) {
    return ((0, jsx_runtime_1.jsxs)(LexicalComposer_1.LexicalComposer, { initialConfig: config_1.default, children: [(0, jsx_runtime_1.jsx)(ToolbarPlugin_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "editor-inner", children: [(0, jsx_runtime_1.jsx)(LexicalRichTextPlugin_1.RichTextPlugin, { contentEditable: (0, jsx_runtime_1.jsx)(LexicalContentEditable_1.ContentEditable, { className: "editor-input" }), placeholder: () => {
                            return (0, jsx_runtime_1.jsx)("p", { className: "editor-placeholder", children: "Start with a title" });
                        }, ErrorBoundary: LexicalErrorBoundary_1.LexicalErrorBoundary }), (0, jsx_runtime_1.jsx)(EditorContentPlugin_1.EditorContentPlugin, { initialTitle: initialTitle, initialContent: initialContent, onContentChange: onContentChange }), (0, jsx_runtime_1.jsx)(LexicalListPlugin_1.ListPlugin, {}), (0, jsx_runtime_1.jsx)(LexicalLinkPlugin_1.LinkPlugin, {}), (0, jsx_runtime_1.jsx)(LexicalHistoryPlugin_1.HistoryPlugin, {}), (0, jsx_runtime_1.jsx)(AutoLinkPlugin_1.default, {}), (0, jsx_runtime_1.jsx)(LexicalAutoFocusPlugin_1.AutoFocusPlugin, {}), (0, jsx_runtime_1.jsx)(CodeHighlightPlugin_1.default, {}), (0, jsx_runtime_1.jsx)(ListMaxIndentLevelPlugin_1.default, { maxDepth: 7 }), (0, jsx_runtime_1.jsx)(LexicalMarkdownShortcutPlugin_1.MarkdownShortcutPlugin, { transformers: markdown_1.TRANSFORMERS })] })] }));
}
exports.default = Editor;
