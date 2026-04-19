import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const initialState = {
  title: '',
  slug: '',
  preview: '',
  content: '',
  published: false,
}

function PoemForm({ defaultValues = initialState, onSubmit, submitLabel = 'Save poem' }) {
  const [formData, setFormData] = useState(defaultValues)
  const [previewTouched, setPreviewTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const prefersReducedMotion = useReducedMotion()

  function buildPreviewFromContent(content = '') {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    return lines.slice(0, 2).join('\n')
  }

  useEffect(() => {
    setFormData(defaultValues)
    setPreviewTouched(Boolean(defaultValues.preview?.trim()))
  }, [defaultValues])

  useEffect(() => {
    if (previewTouched) return
    if (!formData.title.trim()) return

    const generatedPreview = buildPreviewFromContent(formData.content)
    if (!generatedPreview) return

    setFormData((prev) => {
      if (prev.preview === generatedPreview) return prev
      return { ...prev, preview: generatedPreview }
    })
  }, [formData.content, formData.title, previewTouched])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = {
      ...formData,
      slug: formData.slug.trim() || formData.title.toLowerCase().replace(/\s+/g, '-'),
      preview: formData.preview.trim() || buildPreviewFromContent(formData.content),
    }

    const result = await onSubmit(payload)

    if (result?.error) {
      setError(result.error.message || 'Save failed.')
    }

    setSubmitting(false)
  }

  return (
    <form className="poem-form" onSubmit={handleSubmit}>
      <div className="poem-form-header">
        <h2>{formData.title ? 'Edit poem' : 'Write a new poem'}</h2>
        <p>
          Keep the preview short and clear. The full poem can breathe below it, and the slug will
          generate automatically if left blank.
        </p>
      </div>

      <div className="poem-form-grid">
        <label>
          Title
          <input
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="A clear title for the poem"
            required
          />
        </label>
        <label>
          Slug
          <input
            value={formData.slug}
            onChange={(event) => updateField('slug', event.target.value)}
            placeholder="auto-generated if empty"
          />
        </label>
      </div>

      <label>
        Preview
        <textarea
          rows={3}
          value={formData.preview}
          onChange={(event) => {
            setPreviewTouched(true)
            updateField('preview', event.target.value)
          }}
          placeholder="A short excerpt shown on the poems page"
          required
        />
      </label>
      <label>
        Poem
        <textarea
          rows={14}
          value={formData.content}
          onChange={(event) => updateField('content', event.target.value)}
          placeholder="Write the full poem here"
          required
        />
      </label>
      <label className="checkbox-row checkbox-card">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(event) => updateField('published', event.target.checked)}
        />
        <span>
          <strong>Published</strong>
          <small>Visible on the public site when enabled</small>
        </span>
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <motion.button
        className="poem-form-submit"
        type="submit"
        disabled={submitting}
        whileHover={prefersReducedMotion || submitting ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion || submitting ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {submitting ? 'Saving...' : submitLabel}
      </motion.button>
    </form>
  )
}

export default PoemForm
