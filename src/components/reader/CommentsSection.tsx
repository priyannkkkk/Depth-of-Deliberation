'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Reply, Trash2, Heart } from 'lucide-react'
import { useStore } from '@/lib/store'
import { addComment, deleteComment } from '@/lib/queries/interactions'
import { formatRelativeDate } from '@/lib/utils'
import type { Comment } from '@/types'

interface CommentsSectionProps {
  storyId:         string
  initialComments: Comment[]
}

export function CommentsSection({ storyId, initialComments }: CommentsSectionProps) {
  const { user, addToast } = useStore()
  const [comments,  setComments]  = useState<Comment[]>(initialComments)
  const [replyTo,   setReplyTo]   = useState<string | null>(null)
  const [body,      setBody]      = useState('')
  const [name,      setName]      = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = useCallback(async (parentId?: string) => {
    const text = body.trim()
    if (!text) { addToast('Please write something first', 'error'); return }

    setLoading(true)
    try {
      const comment = await addComment(
        storyId,
        { body: text, author_name: name.trim() || undefined, parent_id: parentId },
        user?.id
      )

      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies ?? []), comment] }
              : c
          )
        )
      } else {
        setComments((prev) => [{ ...comment, replies: [] }, ...prev])
      }

      setBody('')
      setName('')
      setReplyTo(null)
      addToast('Reflection shared ✦')
    } catch {
      addToast('Could not post comment', 'error')
    } finally {
      setLoading(false)
    }
  }, [body, name, storyId, user, addToast])

  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await deleteComment(commentId)
      setComments((prev) => {
        // Remove top-level or nested
        const removeFromList = (list: Comment[]): Comment[] =>
          list
            .filter((c) => c.id !== commentId)
            .map((c) => ({ ...c, replies: removeFromList(c.replies ?? []) }))
        return removeFromList(prev)
      })
      addToast('Comment removed')
    } catch {
      addToast('Could not delete comment', 'error')
    }
  }, [addToast])

  return (
    <div className="pt-14">
      <h2 className="font-serif font-light text-cream text-[1.5rem] mb-8">
        Leave a Reflection
      </h2>

      {/* ── Comment form ─────────────────────────── */}
      <CommentForm
        value={body}
        nameValue={name}
        onChangeBody={setBody}
        onChangeName={setName}
        onSubmit={() => handleSubmit()}
        loading={loading}
        user={user}
      />

      {/* ── Comment list ─────────────────────────── */}
      <div className="mt-12 flex flex-col gap-5">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={28} className="text-[var(--ink-muted)] mx-auto mb-3" />
            <p className="font-serif italic text-[var(--ink-muted)] text-sm">
              Be the first to leave a reflection.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <CommentItem
                  comment={comment}
                  onDelete={handleDelete}
                  onReply={setReplyTo}
                  replyTo={replyTo}
                  onSubmitReply={(parentId) => handleSubmit(parentId)}
                  loading={loading}
                  body={body}
                  name={name}
                  onChangeBody={setBody}
                  onChangeName={setName}
                  user={user}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

/* ── Single comment ───────────────────────────── */
function CommentItem({
  comment, onDelete, onReply, replyTo,
  onSubmitReply, loading, body, name,
  onChangeBody, onChangeName, user,
}: {
  comment:       Comment
  onDelete:      (id: string) => void
  onReply:       (id: string | null) => void
  replyTo:       string | null
  onSubmitReply: (parentId: string) => void
  loading:       boolean
  body:          string
  name:          string
  onChangeBody:  (v: string) => void
  onChangeName:  (v: string) => void
  user:          import('@/types').Profile | null
}) {
  const displayName = comment.author?.display_name ?? comment.author_name ?? 'Anonymous'
  const canDelete   = user && (user.id === comment.user_id || user.is_admin)

  return (
    <div className="flex flex-col gap-2">
      {/* Comment bubble */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {comment.author?.avatar_url ? (
              <img
                src={comment.author.avatar_url}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--gold-faint)]
                              flex items-center justify-center
                              text-gold text-xs font-serif border border-[var(--border)]">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <span className="text-cream text-[0.83rem] font-medium">{displayName}</span>
            <span className="text-[var(--ink-muted)] text-[0.65rem]">
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onReply(replyTo === comment.id ? null : comment.id)}
              className="text-[var(--ink-muted)] hover:text-gold text-[0.65rem]
                         tracking-[0.1em] uppercase flex items-center gap-1
                         transition-colors duration-200"
            >
              <Reply size={11} /> Reply
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[var(--ink-muted)] hover:text-red-400 transition-colors"
                aria-label="Delete comment"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        <p className="font-serif italic text-[var(--ink-secondary)] text-[0.97rem] leading-[1.8]">
          {comment.body}
        </p>
      </div>

      {/* Reply form */}
      <AnimatePresence>
        {replyTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{  opacity: 0, height: 0 }}
            className="ml-6 overflow-hidden"
          >
            <CommentForm
              value={body}
              nameValue={name}
              onChangeBody={onChangeBody}
              onChangeName={onChangeName}
              onSubmit={() => onSubmitReply(comment.id)}
              loading={loading}
              user={user}
              compact
              onCancel={() => onReply(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested replies */}
      {(comment.replies ?? []).length > 0 && (
        <div className="ml-6 flex flex-col gap-2 border-l border-[var(--border)] pl-4">
          {(comment.replies ?? []).map((reply) => (
            <div key={reply.id} className="p-4 bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cream text-[0.78rem] font-medium">
                  {reply.author?.display_name ?? reply.author_name ?? 'Anonymous'}
                </span>
                <span className="text-[var(--ink-muted)] text-[0.62rem]">
                  {formatRelativeDate(reply.created_at)}
                </span>
              </div>
              <p className="font-serif italic text-[var(--ink-secondary)] text-[0.92rem] leading-[1.75]">
                {reply.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Comment form ─────────────────────────────── */
function CommentForm({
  value, nameValue, onChangeBody, onChangeName,
  onSubmit, loading, user, compact, onCancel,
}: {
  value:          string
  nameValue:      string
  onChangeBody:   (v: string) => void
  onChangeName:   (v: string) => void
  onSubmit:       () => void
  loading:        boolean
  user:           import('@/types').Profile | null
  compact?:       boolean
  onCancel?:      () => void
}) {
  return (
    <div className={`flex flex-col gap-2.5 ${compact ? 'mt-2' : ''}`}>
      {!user && (
        <input
          type="text"
          placeholder="Your name (optional)"
          value={nameValue}
          onChange={(e) => onChangeName(e.target.value)}
          className="input text-sm"
        />
      )}
      <textarea
        placeholder={compact ? 'Write a reply…' : 'Share what this story stirred in you…'}
        value={value}
        onChange={(e) => onChangeBody(e.target.value)}
        rows={compact ? 2 : 3}
        className="input text-sm resize-none"
      />
      <div className="flex gap-2.5 self-start">
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="btn-ghost text-xs disabled:opacity-50 disabled:cursor-not-allowed py-2 px-5"
        >
          {loading ? 'Posting…' : compact ? 'Post Reply' : 'Post Reflection'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-[0.72rem] text-[var(--ink-muted)] hover:text-gold
                       tracking-[0.1em] uppercase transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
