import React from 'react'
import {$generateNodesFromDOM, $generateHtmlFromNodes} from '@lexical/html'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {
  $getRoot,
  $insertNodes,
  $createTextNode,
  $createParagraphNode
}
from 'lexical'

export type EditorContentProps = {
  initialTitle: string,
  initialContent: string,
  onContentChange: Function
}


export function EditorContentPlugin({initialTitle, initialContent, onContentChange}: EditorContentProps) {
  const [editor] = useLexicalComposerContext()

  React.useEffect(() => {
    editor.update(() => {
      if(initialTitle) {
        const parser = new DOMParser()
        const paragraphNode = $createParagraphNode()

        paragraphNode.append($createTextNode(initialTitle))
        const nodes = $generateNodesFromDOM(
          editor,
          parser.parseFromString(initialContent, 'text/html')
        )
        $insertNodes([paragraphNode].concat(nodes as never))
      }
    })
  }, [])

  React.useEffect(() => {
    const removeListener = editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        if(onContentChange) {
          const title = $getRoot().getFirstChild()?.getTextContent()
          const {root} = editorState.toJSON()

          delete root.children[0]
          const parsed = editor.parseEditorState(JSON.stringify({
            root: {
              ...root,
              children: root.children.filter((v: any) => v)
            }
          }))

          parsed.read(() => {
            const root = $getRoot()
            onContentChange({
              title,
              content: $generateHtmlFromNodes(editor),
              description: root.getTextContent()
            })
          })
        }
      })
    })
    return () => removeListener()
  }, [])

  return null
}