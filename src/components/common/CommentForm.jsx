import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

function CommentForm({ onSubmit, poemId }) {
  const prefersReducedMotion = useReducedMotion()
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!body.trim()) {
      setError('Comment cannot be empty.')
      return
    }

    setSubmitting(true)
    const result = await onSubmit({ poem_id: poemId, name: authorName, content: body })

    if (result.error) {
      setError(result.error.message || 'Could not add comment.')
    } else {
      setAuthorName('')
      setBody('')
    }

    setSubmitting(false)
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-form-header">
        <h3>Leave a thought</h3>
        <p>Share a line, a feeling, or a quiet reaction if this poem stayed with you.</p>
      </div>
      <label>
        Name
        <input
          type="text"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Optional"
        />
      </label>
      <label>
        Comment
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="Write your thought here..."
          required
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={prefersReducedMotion || submitting ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion || submitting ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {submitting ? 'Posting...' : 'Post comment'}
      </motion.button>
    </form>
  )
}

export default CommentForm
