import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

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
      <style>{`
        .rich-text-editor {
          border: 1px solid color-mix(in srgb, var(--text-muted) 35%, transparent);
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-primary);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .rich-text-editor:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 14%, transparent);
        }

        .rich-text-editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          padding: 0.5rem;
          border-bottom: 1px solid color-mix(in srgb, var(--text-muted) 22%, transparent);
          background: color-mix(in srgb, var(--primary-color) 6%, var(--bg-primary));
        }

        .rich-text-editor-toolbar button {
          min-width: 2.25rem;
          padding: 0.35rem 0.6rem;
          border: 1px solid color-mix(in srgb, var(--text-muted) 35%, transparent);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .rich-text-editor-toolbar button:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .rich-text-editor-toolbar button.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: #fff;
        }

        .rich-text-editor-content {
          min-height: 180px;
          padding: 0.85rem;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          line-height: 1.7;
        }

        .rich-text-editor-content h2 {
          margin: 0 0 0.75rem;
          color: var(--primary-color);
          font-size: 1.25rem;
          line-height: 1.35;
        }

        .rich-text-editor-content p {
          margin: 0 0 0.75rem;
        }

        .rich-text-editor-content ul,
        .rich-text-editor-content ol {
          padding-left: 1.5rem;
          margin: 0 0 0.75rem;
        }

        .rich-text-editor-content ul {
          list-style: disc;
        }

        .rich-text-editor-content ol {
          list-style: decimal;
        }

        .rich-text-editor-content hr {
          border: 0;
          border-top: 1px solid var(--primary-color);
          margin: 1rem 0;
        }
      `}</style>
      <div className="rich-text-editor-toolbar" aria-label="Post formatting controls">
        {toolbarButtons.map((button) => (
          <button
            key={button.title}
            type="button"
            title={button.title}
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
