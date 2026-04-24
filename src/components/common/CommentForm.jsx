import { motion, useReducedMotion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { UI } from '../../config/constants'
import { validateCommentInput } from '../../utils/poemValidation'

const MotionButton = motion.button

function CommentForm({ onSubmit, poemId }) {
  const prefersReducedMotion = useReducedMotion()
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const successTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess(false)

    const validation = validateCommentInput({ poem_id: poemId, name: authorName, content: body })

    if (!validation.isValid) {
      setError(validation.error.message)
      return
    }

    setSubmitting(true)

    try {
      const result = await onSubmit(validation.values)

      if (result?.error) {
        setError(result.error.message || 'Could not add comment. Please try again.')
        return
      }

      setAuthorName('')
      setBody('')
      setSuccess(true)
      setError('')

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }

      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false)
      }, UI.SUCCESS_MESSAGE_DURATION_MS)
    } catch (err) {
      setError(err?.message || 'Failed to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
          disabled={submitting}
        />
      </label>
      <label>
        Comment
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="Write your thought here..."
          disabled={submitting}
          required
          aria-describedby={error || success ? 'comment-feedback' : undefined}
        />
      </label>
      {error && (
        <p className="error-text" id="comment-feedback" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p
          className="success-text"
          id="comment-feedback"
          role="status"
        >
          Your comment has been posted. Thank you for sharing your thoughts.
        </p>
      )}
      <MotionButton
        type="submit"
        disabled={submitting}
        whileHover={prefersReducedMotion || submitting ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion || submitting ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {submitting ? 'Posting...' : 'Post comment'}
      </MotionButton>
    </form>
  )
}

export default CommentForm
