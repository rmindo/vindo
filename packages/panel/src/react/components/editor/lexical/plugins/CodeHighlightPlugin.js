"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("@lexical/code");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const react_1 = require("react");
function CodeHighlightPlugin() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    (0, react_1.useEffect)(() => {
        return (0, code_1.registerCodeHighlighting)(editor);
    }, [editor]);
    return null;
}
exports.default = CodeHighlightPlugin;
