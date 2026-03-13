"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const react_1 = require("react");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const selection_1 = require("@lexical/selection");
const rich_text_1 = require("@lexical/rich-text");
function Divider() {
    return (0, jsx_runtime_1.jsx)("div", { className: "divider" });
}
// Define the available block types
const blockTypeOptions = {
    paragraph: 'Normal',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
};
function HeadingDropdown() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [blockType, setBlockType] = (0, react_1.useState)('paragraph');
    const formatHeading = (headingLevel) => {
        editor.update(() => {
            const selection = (0, lexical_1.$getSelection)();
            // Ensure the selection is a range selection (i.e., the user has focused the editor)
            if ((0, lexical_1.$isRangeSelection)(selection)) {
                (0, selection_1.$setBlocksType)(selection, () => (0, rich_text_1.$createHeadingNode)(headingLevel));
            }
        });
    };
    const onChange = (event) => {
        const value = event.target.value;
        setBlockType(value);
        formatHeading(value);
    };
    return ((0, jsx_runtime_1.jsx)("select", { value: blockType, onChange: onChange, children: Object.entries(blockTypeOptions).map(([type, label]) => ((0, jsx_runtime_1.jsx)("option", { value: type, children: label }, type))) }));
}
function ToolbarPlugin() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const toolbarRef = (0, react_1.useRef)(null);
    const [canUndo, setCanUndo] = (0, react_1.useState)(false);
    const [canRedo, setCanRedo] = (0, react_1.useState)(false);
    const [isBold, setIsBold] = (0, react_1.useState)(false);
    const [isItalic, setIsItalic] = (0, react_1.useState)(false);
    const [isUnderline, setIsUnderline] = (0, react_1.useState)(false);
    const [isStrikethrough, setIsStrikethrough] = (0, react_1.useState)(false);
    const $updateToolbar = (0, react_1.useCallback)(() => {
        const selection = (0, lexical_1.$getSelection)();
        if ((0, lexical_1.$isRangeSelection)(selection)) {
            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
        }
    }, []);
    (0, react_1.useEffect)(() => {
        return (0, utils_1.mergeRegister)(editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                $updateToolbar();
            }, { editor });
        }), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, (_payload, _newEditor) => {
            $updateToolbar();
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.CAN_UNDO_COMMAND, (payload) => {
            setCanUndo(payload);
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.CAN_REDO_COMMAND, (payload) => {
            setCanRedo(payload);
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW));
    }, [editor, $updateToolbar]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "toolbar", ref: toolbarRef, children: [(0, jsx_runtime_1.jsx)(HeadingDropdown, {}), (0, jsx_runtime_1.jsx)(Divider, {}), (0, jsx_runtime_1.jsx)("button", { disabled: !canUndo, onClick: () => {
                    editor.dispatchCommand(lexical_1.UNDO_COMMAND, undefined);
                }, className: "toolbar-item spaced", "aria-label": "Undo", children: (0, jsx_runtime_1.jsx)("i", { className: "format undo" }) }), (0, jsx_runtime_1.jsx)("button", { disabled: !canRedo, onClick: () => {
                    editor.dispatchCommand(lexical_1.REDO_COMMAND, undefined);
                }, className: "toolbar-item", "aria-label": "Redo", children: (0, jsx_runtime_1.jsx)("i", { className: "format redo" }) }), (0, jsx_runtime_1.jsx)(Divider, {}), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'bold');
                }, className: 'toolbar-item spaced ' + (isBold ? 'active' : ''), "aria-label": "Format Bold", children: (0, jsx_runtime_1.jsx)("i", { className: "format bold" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'italic');
                }, className: 'toolbar-item spaced ' + (isItalic ? 'active' : ''), "aria-label": "Format Italics", children: (0, jsx_runtime_1.jsx)("i", { className: "format italic" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'underline');
                }, className: 'toolbar-item spaced ' + (isUnderline ? 'active' : ''), "aria-label": "Format Underline", children: (0, jsx_runtime_1.jsx)("i", { className: "format underline" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'strikethrough');
                }, className: 'toolbar-item spaced ' + (isStrikethrough ? 'active' : ''), "aria-label": "Format Strikethrough", children: (0, jsx_runtime_1.jsx)("i", { className: "format strikethrough" }) }), (0, jsx_runtime_1.jsx)(Divider, {}), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'left');
                }, className: "toolbar-item spaced", "aria-label": "Left Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format left-align" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'center');
                }, className: "toolbar-item spaced", "aria-label": "Center Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format center-align" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'right');
                }, className: "toolbar-item spaced", "aria-label": "Right Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format right-align" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'justify');
                }, className: "toolbar-item", "aria-label": "Justify Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format justify-align" }) }), ' '] }));
}
exports.default = ToolbarPlugin;
