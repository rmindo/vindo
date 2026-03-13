"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const lexical_1 = require("lexical");
const react_dom_1 = require("react-dom");
const utils_1 = require("@lexical/utils");
const code_1 = require("@lexical/code");
const selection_1 = require("@lexical/selection");
const link_1 = require("@lexical/link");
const react_1 = require("react");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const rich_text_1 = require("@lexical/rich-text");
const list_1 = require("@lexical/list");
const LowPriority = 1;
const blockTypeToBlockName = {
    paragraph: "Normal",
    h1: "Large Heading",
    h2: "Small Heading",
    h3: "Heading",
    h4: "Heading",
    h5: "Heading",
};
const supportedBlockTypes = new Set([
    "paragraph",
    "quote",
    "code",
    "h1",
    "h2",
    "ul",
    "ol"
]);
function positionEditorElement(editor, rect) {
    if (rect === null) {
        editor.style.opacity = "0";
        editor.style.top = "-1000px";
        editor.style.left = "-1000px";
    }
    else {
        editor.style.opacity = "1";
        editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
        editor.style.left = `${rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2}px`;
    }
}
function getSelectedNode(selection) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return (0, selection_1.$isAtNodeEnd)(focus) ? anchorNode : focusNode;
    }
    else {
        return (0, selection_1.$isAtNodeEnd)(anchor) ? focusNode : anchorNode;
    }
}
function FloatingLinkEditor({ editor }) {
    const editorRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const mouseDownRef = (0, react_1.useRef)(false);
    const [linkUrl, setLinkUrl] = (0, react_1.useState)("");
    const [isEditMode, setEditMode] = (0, react_1.useState)(false);
    const [lastSelection, setLastSelection] = (0, react_1.useState)(null);
    const updateLinkEditor = (0, react_1.useCallback)(() => {
        const selection = (0, lexical_1.$getSelection)();
        if ((0, lexical_1.$isRangeSelection)(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ((0, link_1.$isLinkNode)(parent)) {
                setLinkUrl(parent.getURL());
            }
            else if ((0, link_1.$isLinkNode)(node)) {
                setLinkUrl(node.getURL());
            }
            else {
                setLinkUrl("");
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;
        if (editorElem === null) {
            return;
        }
        const rootElement = editor.getRootElement();
        if (selection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode)) {
            const domRange = nativeSelection.getRangeAt(0);
            let rect;
            if (nativeSelection.anchorNode === rootElement) {
                let inner = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild;
                }
                rect = inner.getBoundingClientRect();
            }
            else {
                rect = domRange.getBoundingClientRect();
            }
            if (!mouseDownRef.current) {
                positionEditorElement(editorElem, rect);
            }
            setLastSelection(selection);
        }
        else if (!activeElement || activeElement.className !== "link-input") {
            positionEditorElement(editorElem, null);
            setLastSelection(null);
            setEditMode(false);
            setLinkUrl("");
        }
        return true;
    }, [editor]);
    (0, react_1.useEffect)(() => {
        return (0, utils_1.mergeRegister)(editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateLinkEditor();
            });
        }), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, () => {
            updateLinkEditor();
            return true;
        }, LowPriority));
    }, [editor, updateLinkEditor]);
    (0, react_1.useEffect)(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);
    (0, react_1.useEffect)(() => {
        if (isEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditMode]);
    return ((0, jsx_runtime_1.jsx)("div", { ref: editorRef, className: "link-editor", children: isEditMode ? ((0, jsx_runtime_1.jsx)("input", { ref: inputRef, className: "link-input", value: linkUrl, onChange: (event) => {
                setLinkUrl(event.target.value);
            }, onKeyDown: (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    if (lastSelection !== null) {
                        if (linkUrl !== "") {
                            editor.dispatchCommand(link_1.TOGGLE_LINK_COMMAND, linkUrl);
                        }
                        setEditMode(false);
                    }
                }
                else if (event.key === "Escape") {
                    event.preventDefault();
                    setEditMode(false);
                }
            } })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "link-input", children: [(0, jsx_runtime_1.jsx)("a", { href: linkUrl, target: "_blank", rel: "noopener noreferrer", children: linkUrl }), (0, jsx_runtime_1.jsx)("div", { className: "link-edit", role: "button", tabIndex: 0, onMouseDown: (event) => event.preventDefault(), onClick: () => {
                            setEditMode(true);
                        } })] }) })) }));
}
function HeadingDropdown({ editor, blockType, toolbarRef, setBlockType, setShowBlockOptionsDropDown }) {
    const dropDownRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const toolbar = toolbarRef.current;
        const dropDown = dropDownRef.current;
        if (toolbar !== null && dropDown !== null) {
            const { top, left } = toolbar.getBoundingClientRect();
            dropDown.style.top = `${top + 40}px`;
            dropDown.style.left = `${left}px`;
        }
    }, [dropDownRef, toolbarRef]);
    (0, react_1.useEffect)(() => {
        const dropDown = dropDownRef.current;
        const toolbar = toolbarRef.current;
        if (dropDown !== null && toolbar !== null) {
            const handle = (event) => {
                const target = event.target;
                if (!dropDown.contains(target) && !toolbar.contains(target)) {
                    setShowBlockOptionsDropDown(false);
                }
            };
            document.addEventListener("click", handle);
            return () => {
                document.removeEventListener("click", handle);
            };
        }
    }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);
    const formatHeading = (headingLevel) => {
        editor.update(() => {
            const selection = (0, lexical_1.$getSelection)();
            // Ensure the selection is a range selection (i.e., the user has focused the editor)
            if ((0, lexical_1.$isRangeSelection)(selection)) {
                (0, selection_1.$setBlocksType)(selection, () => (0, rich_text_1.$createHeadingNode)(headingLevel));
            }
            setShowBlockOptionsDropDown(false);
        });
    };
    const formatParagraph = () => {
        if (blockType !== "paragraph") {
            editor.update(() => {
                const selection = (0, lexical_1.$getSelection)();
                if ((0, lexical_1.$isRangeSelection)(selection)) {
                    (0, selection_1.$setBlocksType)(selection, () => (0, lexical_1.$createParagraphNode)());
                }
            });
            setBlockType('paragraph');
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatLargeHeading = () => {
        if (blockType !== 'h1') {
            editor.update(() => {
                const selection = (0, lexical_1.$getSelection)();
                if ((0, lexical_1.$isRangeSelection)(selection)) {
                    (0, selection_1.$setBlocksType)(selection, () => (0, rich_text_1.$createHeadingNode)('h1'));
                }
            });
            setBlockType('h1');
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatMediumHeading = () => {
        if (blockType !== 'h2') {
            editor.update(() => {
                const selection = (0, lexical_1.$getSelection)();
                if ((0, lexical_1.$isRangeSelection)(selection)) {
                    (0, selection_1.$setBlocksType)(selection, () => (0, rich_text_1.$createHeadingNode)('h2'));
                }
            });
            setBlockType('h2');
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatSmallHeading = () => {
        if (blockType !== 'h3') {
            editor.update(() => {
                const selection = (0, lexical_1.$getSelection)();
                if ((0, lexical_1.$isRangeSelection)(selection)) {
                    (0, selection_1.$setBlocksType)(selection, () => (0, rich_text_1.$createHeadingNode)('h3'));
                }
            });
            setBlockType('h3');
        }
        setShowBlockOptionsDropDown(false);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dropdown", ref: dropDownRef, children: [(0, jsx_runtime_1.jsxs)("button", { className: "item", onClick: formatParagraph, children: [(0, jsx_runtime_1.jsx)("span", { className: "icon paragraph" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: "Normal" }), blockType === "paragraph" && (0, jsx_runtime_1.jsx)("span", { className: "active" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "item", onClick: formatLargeHeading, children: [(0, jsx_runtime_1.jsx)("span", { className: "icon large-heading" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: "Large Heading" }), blockType === "h1" && (0, jsx_runtime_1.jsx)("span", { className: "active" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "item", onClick: formatMediumHeading, children: [(0, jsx_runtime_1.jsx)("span", { className: "icon medium-heading" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: "Medium Heading" }), blockType === "h2" && (0, jsx_runtime_1.jsx)("span", { className: "active" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "item", onClick: formatSmallHeading, children: [(0, jsx_runtime_1.jsx)("span", { className: "icon small-heading" }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: "Small Heading" }), blockType === "h3" && (0, jsx_runtime_1.jsx)("span", { className: "active" })] })] }));
}
function ToolbarPlugin() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const toolbarRef = (0, react_1.useRef)(null);
    const [isLink, setIsLink] = (0, react_1.useState)(false);
    const [canUndo, setCanUndo] = (0, react_1.useState)(false);
    const [canRedo, setCanRedo] = (0, react_1.useState)(false);
    const [isBold, setIsBold] = (0, react_1.useState)(false);
    const [isItalic, setIsItalic] = (0, react_1.useState)(false);
    const [isUnderline, setIsUnderline] = (0, react_1.useState)(false);
    const [isStrikethrough, setIsStrikethrough] = (0, react_1.useState)(false);
    const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = (0, react_1.useState)(false);
    const [blockType, setBlockType] = (0, react_1.useState)("paragraph");
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
    const insertLink = (0, react_1.useCallback)(() => {
        if (!isLink) {
            editor.dispatchCommand(link_1.TOGGLE_LINK_COMMAND, "https://");
        }
        else {
            editor.dispatchCommand(link_1.TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);
    const formatQuote = () => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = (0, lexical_1.$getSelection)();
                if ((0, lexical_1.$isRangeSelection)(selection)) {
                    (0, selection_1.$setBlocksType)(selection, () => (0, rich_text_1.$createQuoteNode)());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatCode = () => {
        if (blockType !== "code") {
            editor.update(() => {
                const selection = (0, lexical_1.$getSelection)();
                if ((0, lexical_1.$isRangeSelection)(selection)) {
                    (0, selection_1.$setBlocksType)(selection, () => (0, code_1.$createCodeNode)());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatBulletList = () => {
        if (blockType !== "ul") {
            editor.dispatchCommand(list_1.INSERT_UNORDERED_LIST_COMMAND, undefined);
        }
        else {
            editor.dispatchCommand(list_1.REMOVE_LIST_COMMAND, undefined);
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatNumberedList = () => {
        if (blockType !== "ol") {
            editor.dispatchCommand(list_1.INSERT_ORDERED_LIST_COMMAND, undefined);
        }
        else {
            editor.dispatchCommand(list_1.REMOVE_LIST_COMMAND, undefined);
        }
        setShowBlockOptionsDropDown(false);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "toolbar", ref: toolbarRef, children: [supportedBlockTypes.has(blockType) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("button", { className: "toolbar-item block-controls", onClick: () => setShowBlockOptionsDropDown(!showBlockOptionsDropDown), "aria-label": "Formatting Options", children: [(0, jsx_runtime_1.jsx)("span", { className: "icon block-type " + blockType }), (0, jsx_runtime_1.jsx)("span", { className: "text", children: blockTypeToBlockName[blockType] }), (0, jsx_runtime_1.jsx)("i", { className: "chevron-down" })] }), showBlockOptionsDropDown &&
                        (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)(HeadingDropdown, { editor: editor, blockType: blockType, toolbarRef: toolbarRef, setBlockType: setBlockType, setShowBlockOptionsDropDown: setShowBlockOptionsDropDown }), document.body)] })), (0, jsx_runtime_1.jsx)("span", { className: "divider" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'bold');
                }, className: 'toolbar-item spaced ' + (isBold ? 'active' : ''), "aria-label": "Format Bold", children: (0, jsx_runtime_1.jsx)("i", { className: "format bold" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'italic');
                }, className: 'toolbar-item spaced ' + (isItalic ? 'active' : ''), "aria-label": "Format Italics", children: (0, jsx_runtime_1.jsx)("i", { className: "format italic" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'underline');
                }, className: 'toolbar-item spaced ' + (isUnderline ? 'active' : ''), "aria-label": "Format Underline", children: (0, jsx_runtime_1.jsx)("i", { className: "format underline" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_TEXT_COMMAND, 'strikethrough');
                }, className: 'toolbar-item spaced ' + (isStrikethrough ? 'active' : ''), "aria-label": "Format Strikethrough", children: (0, jsx_runtime_1.jsx)("i", { className: "format strikethrough" }) }), (0, jsx_runtime_1.jsx)("span", { className: "divider" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'left');
                }, className: "toolbar-item spaced", "aria-label": "Left Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format left-align" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'center');
                }, className: "toolbar-item spaced", "aria-label": "Center Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format center-align" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'right');
                }, className: "toolbar-item spaced", "aria-label": "Right Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format right-align" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    editor.dispatchCommand(lexical_1.FORMAT_ELEMENT_COMMAND, 'justify');
                }, className: "toolbar-item spaced", "aria-label": "Justify Align", children: (0, jsx_runtime_1.jsx)("i", { className: "format justify-align" }) }), (0, jsx_runtime_1.jsx)("span", { className: "divider" }), (0, jsx_runtime_1.jsx)("button", { className: "toolbar-item", "aria-label": "Quote", onClick: formatQuote, children: (0, jsx_runtime_1.jsx)("i", { className: "format quote" }) }), (0, jsx_runtime_1.jsx)("button", { className: "toolbar-item spaced", "aria-label": "Bullet List", onClick: formatBulletList, children: (0, jsx_runtime_1.jsx)("i", { className: "format bullet-list" }) }), (0, jsx_runtime_1.jsx)("button", { className: "toolbar-item spaced", "aria-label": "Numbered List", onClick: formatNumberedList, children: (0, jsx_runtime_1.jsx)("i", { className: "format numbered-list" }) }), (0, jsx_runtime_1.jsx)("button", { className: "toolbar-item", "aria-label": "Code Block", onClick: formatCode, children: (0, jsx_runtime_1.jsx)("i", { className: "format code" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: insertLink, className: "toolbar-item spaced " + (isLink ? "active" : ""), "aria-label": "Insert Link", children: (0, jsx_runtime_1.jsx)("i", { className: "format link" }) }), isLink && (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)(FloatingLinkEditor, { editor: editor }), document.body), (0, jsx_runtime_1.jsx)("span", { className: "divider" }), (0, jsx_runtime_1.jsx)("button", { disabled: !canUndo, onClick: () => {
                    editor.dispatchCommand(lexical_1.UNDO_COMMAND, undefined);
                }, className: "toolbar-item spaced", "aria-label": "Undo", children: (0, jsx_runtime_1.jsx)("i", { className: "format undo" }) }), (0, jsx_runtime_1.jsx)("button", { disabled: !canRedo, onClick: () => {
                    editor.dispatchCommand(lexical_1.REDO_COMMAND, undefined);
                }, className: "toolbar-item", "aria-label": "Redo", children: (0, jsx_runtime_1.jsx)("i", { className: "format redo" }) })] }));
}
exports.default = ToolbarPlugin;
