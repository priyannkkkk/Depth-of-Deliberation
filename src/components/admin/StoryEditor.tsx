'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit    from '@tiptap/starter-kit'
import ImageExt      from '@tiptap/extension-image'
import LinkExt       from '@tiptap/extension-link'
import Placeholder   from '@tiptap/extension-placeholder'
import Typography    from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import { motion }    from 'framer-motion'
import {
  Bold, Italic, Quote, Image as ImageIcon,
  Link2, List, Heading2, Heading3,
  Eye, EyeOff, Save, Send, Trash2, X
} from 'lucide-react'
import { slugify, getReadingTime } from '@/lib/utils'
import { STORY_TAGS } from '@/types'
import type { Story, StoryFormData, StoryStatus } from '@/types'

interface StoryEditorProps {
  story?: Story  // if provided = edit mode, else = create mode
}

const EMPTY_FORM: StoryFormData = {
  title:          '',
  slug:           '',
  lesson:         '',
  body_html:      '',
  excerpt:        '',
  tags:           [],
  status:         'draft',
  featured:       false,
  featured_size:  'medium',
  featured_order: 0,
  accent_color:   '#1a1208',
}

export function StoryEditor({ story }: StoryEditorProps) {
  const router  = useRouter()
  const isEdit  = !!story

  const [form,    setForm]    = useState<StoryFormData>(
    story
      ? {
          title:         story.title,
          slug:          story.slug,
          lesson:        story.lesson ?? '',
          body_html:     story.body_html,
          excerpt:       story.excerpt ?? '',
          tags:          story.tags,
          status:        story.status,
          featured:      story.featured,
          featured_size: story.featured_size,
          featured_order:story.featured_order,
          accent_color:  story.accent_color,
        }
      : EMPTY_FORM
  )
  const [saving,   setSaving]   = useState(false)
  const [preview,  setPreview]  = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt,
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Begin writing your story…' }),
      Typography,
      CharacterCount,
    ],
    content:   story?.body_html ?? '',
    editorProps: { attributes: { class: 'tiptap-editor' } },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setForm((f) => ({
        ...f,
        body_html:  html,
        read_time:  getReadingTime(html),
      } as StoryFormData & { read_time: number }))
    },
  })

  // Auto-slug from title
  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: isEdit ? f.slug : slugify(title),
    }))
  }

  // Tag management
  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !form.tags.includes(t) && form.tags.length < 6) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }
  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))

  // Save
  const handleSave = useCallback(async (status?: StoryStatus) => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!editor?.getText().trim()) { setError('Story body is required'); return }

    setSaving(true)
    setError(null)

    try {
      const payload = { ...form, status: status ?? form.status }
      const endpoint = isEdit ? `/api/admin/stories/${story!.id}` : '/api/admin/stories'
      const method   = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(await res.text())

      const saved = await res.json()
      router.push('/admin/stories')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }, [form, editor, isEdit, story, router])

  const readingTime = getReadingTime(form.body_html)

  return (
    <div className="max-w-[900px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-cream text-2xl font-light">
            {isEdit ? 'Edit Story' : 'New Story'}
          </h1>
          <p className="text-[var(--ink-muted)] text-xs mt-1">
            {readingTime} min read ·{' '}
            {editor?.storage.characterCount.words() ?? 0} words
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setPreview((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 text-[0.72rem] uppercase tracking-wider
                       text-[var(--ink-secondary)] border border-[var(--border)]
                       hover:text-gold hover:border-[var(--gold-dim)] transition-all"
          >
            {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            {preview ? 'Edit' : 'Preview'}
          </button>

          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-[0.72rem] uppercase tracking-wider
                       text-[var(--ink-secondary)] border border-[var(--border)]
                       hover:text-gold hover:border-[var(--gold-dim)] transition-all
                       disabled:opacity-50"
          >
            <Save size={13} /> Save Draft
          </button>

          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-primary py-2 px-5 text-[0.72rem] disabled:opacity-50"
          >
            <Send size={13} /> {saving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-900/20 border border-red-800/40 text-red-400 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {preview ? (
        /* ── Preview mode ── */
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8">
          <h2 className="font-serif text-cream text-4xl font-light mb-3">{form.title}</h2>
          {form.lesson && <p className="font-serif italic text-gold mb-8">{form.lesson}</p>}
          <div
            className="story-body drop-cap"
            dangerouslySetInnerHTML={{ __html: form.body_html }}
          />
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-4">

          {/* Title */}
          <div>
            <label className="section-label block mb-2">Title *</label>
            <input
              type="text"
              placeholder="Story title…"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input font-serif text-xl text-cream placeholder:text-[var(--ink-muted)]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="section-label block mb-2">Slug *</label>
            <input
              type="text"
              placeholder="url-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              className="input text-sm font-mono text-[var(--ink-secondary)]"
            />
          </div>

          {/* Lesson */}
          <div>
            <label className="section-label block mb-2">Lesson Tagline</label>
            <input
              type="text"
              placeholder="Lesson on Resilience…"
              value={form.lesson}
              onChange={(e) => setForm((f) => ({ ...f, lesson: e.target.value }))}
              className="input"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="section-label block mb-2">Excerpt (card preview)</label>
            <textarea
              placeholder="A one or two line teaser shown on story cards…"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Editor toolbar */}
          {editor && (
            <div>
              <label className="section-label block mb-2">Body *</label>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 p-3 bg-[var(--bg-card)]
                              border border-b-0 border-[var(--border)]">
                {[
                  { icon: Bold,      action: () => editor.chain().focus().toggleBold().run(),      active: editor.isActive('bold') },
                  { icon: Italic,    action: () => editor.chain().focus().toggleItalic().run(),    active: editor.isActive('italic') },
                  { icon: Heading2,  action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
                  { icon: Heading3,  action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
                  { icon: Quote,     action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
                  { icon: List,      action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                ].map(({ icon: Icon, action, active }, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={action}
                    className={`p-2 transition-colors duration-200
                                ${active
                                  ? 'text-gold bg-[var(--gold-faint)]'
                                  : 'text-[var(--ink-muted)] hover:text-gold hover:bg-[var(--gold-faint)]'
                                }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>

              {/* Editor body */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] px-6 py-4 min-h-[400px]">
                <EditorContent editor={editor} />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="section-label block mb-2">Tags (max 6)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag) => (
                <span key={tag} className="tag flex items-center gap-1.5">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-[var(--ink-muted)] hover:text-red-400">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
                className="input text-sm flex-1"
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                {STORY_TAGS.map((t) => <option key={t} value={t} />)}
              </datalist>
              <button
                onClick={() => addTag(tagInput)}
                className="btn-ghost py-2 px-4 text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Settings row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Featured */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4">
              <label className="section-label block mb-3">Featured</label>
              <button
                onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                className={`w-full py-1.5 text-xs uppercase tracking-wider border transition-all
                            ${form.featured
                              ? 'bg-[var(--gold-faint)] text-gold border-[var(--gold-dim)]'
                              : 'border-[var(--border)] text-[var(--ink-muted)]'
                            }`}
              >
                {form.featured ? 'Featured ✓' : 'Not Featured'}
              </button>
            </div>

            {/* Featured size */}
            {form.featured && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4">
                <label className="section-label block mb-3">Card Size</label>
                <select
                  value={form.featured_size}
                  onChange={(e) => setForm((f) => ({ ...f, featured_size: e.target.value as typeof f.featured_size }))}
                  className="input text-xs py-1.5"
                >
                  <option value="large">Large (left)</option>
                  <option value="medium">Medium (right top)</option>
                  <option value="medium2">Medium (right bottom)</option>
                </select>
              </div>
            )}

            {/* Accent color */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4">
              <label className="section-label block mb-3">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))}
                  className="w-8 h-8 cursor-pointer bg-transparent border-0"
                />
                <span className="text-[var(--ink-muted)] text-xs font-mono">{form.accent_color}</span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4">
              <label className="section-label block mb-3">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StoryStatus }))}
                className="input text-xs py-1.5"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
