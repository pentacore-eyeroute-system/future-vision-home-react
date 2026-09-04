import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './RichTextEditor.css'

const toolbarButtons = [
  { label: 'B', title: 'Bold', action: (editor) => editor.chain().focus().toggleBold().run(), active: (editor) => editor.isActive('bold') },
  { label: 'I', title: 'Italic', action: (editor) => editor.chain().focus().toggleItalic().run(), active: (editor) => editor.isActive('italic') },
  { label: 'H2', title: 'Heading', action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: (editor) => editor.isActive('heading', { level: 2 }) },
  { label: 'Bullets', title: 'Bullet list', action: (editor) => editor.chain().focus().toggleBulletList().run(), active: (editor) => editor.isActive('bulletList') },
  { label: 'Numbers', title: 'Numbered list', action: (editor) => editor.chain().focus().toggleOrderedList().run(), active: (editor) => editor.isActive('orderedList') },
  { label: 'Line', title: 'Horizontal line', action: (editor) => editor.chain().focus().setHorizontalRule().run(), active: () => false },
]

function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getText().trim() ? editor.getHTML() : '')
    },
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === value) {
      return
    }

    editor.commands.setContent(value || '', false)
  }, [editor, value])

  if (!editor) {
    return null
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor-toolbar" role="toolbar" aria-label="Text formatting controls">
        {toolbarButtons.map((button) => (
          <button
            key={button.title}
            type="button"
            title={button.title}
            aria-label={button.title}
            aria-pressed={button.active(editor)}
            className={button.active(editor) ? 'active' : ''}
            onClick={() => button.action(editor)}
          >
            {button.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
