import theme from './theme'


import {TextNode, ParagraphNode} from 'lexical'
import {AutoLinkNode, LinkNode} from '@lexical/link'
import {ListItemNode, ListNode} from '@lexical/list'
import {HeadingNode, QuoteNode} from '@lexical/rich-text'
import {CodeHighlightNode, CodeNode} from '@lexical/code'
import {TableCellNode, TableNode, TableRowNode} from '@lexical/table'


export default {
  theme,
  namespace: 'vindo',
  nodes: [
    TextNode,
    ListNode,
    CodeNode,
    LinkNode,
    QuoteNode,
    TableNode,
    HeadingNode,
    ListItemNode,
    AutoLinkNode,
    TableRowNode,
    ParagraphNode,
    TableCellNode,
    CodeHighlightNode,
  ],
  onError(e) {
    throw e
  }
}