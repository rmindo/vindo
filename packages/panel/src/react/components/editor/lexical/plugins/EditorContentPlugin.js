"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorContentPlugin = void 0;
const react_1 = __importDefault(require("react"));
const html_1 = require("@lexical/html");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const lexical_1 = require("lexical");
function EditorContentPlugin({ initialTitle, initialContent, onContentChange }) {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    react_1.default.useEffect(() => {
        editor.update(() => {
            if (initialTitle) {
                const parser = new DOMParser();
                const paragraphNode = (0, lexical_1.$createParagraphNode)();
                paragraphNode.append((0, lexical_1.$createTextNode)(initialTitle));
                const nodes = (0, html_1.$generateNodesFromDOM)(editor, parser.parseFromString(initialContent, 'text/html'));
                (0, lexical_1.$insertNodes)([paragraphNode].concat(nodes));
            }
        });
    }, []);
    react_1.default.useEffect(() => {
        const removeListener = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                if (onContentChange) {
                    const title = (0, lexical_1.$getRoot)().getFirstChild()?.getTextContent();
                    const { root } = editorState.toJSON();
                    delete root.children[0];
                    const parsed = editor.parseEditorState(JSON.stringify({
                        root: {
                            ...root,
                            children: root.children.filter((v) => v)
                        }
                    }));
                    parsed.read(() => {
                        const root = (0, lexical_1.$getRoot)();
                        onContentChange({
                            title,
                            content: (0, html_1.$generateHtmlFromNodes)(editor),
                            description: root.getTextContent()
                        });
                    });
                }
            });
        });
        return () => removeListener();
    }, []);
    return null;
}
exports.EditorContentPlugin = EditorContentPlugin;
