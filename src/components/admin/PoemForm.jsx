import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { buildPreviewFromContent, normalizeSlug, validatePoemInput } from '../../utils/poemValidation'

const MotionButton = motion.button

const initialState = {
  title: '',
  slug: '',
  preview: '',
  content: '',
  published: false,
}

function getInitialFormData(defaultValues) {
  return {
    ...initialState,
    ...defaultValues,
    published: Boolean(defaultValues?.published),
  }
}

function PoemForm({ defaultValues = initialState, onSubmit, submitLabel = 'Save poem' }) {
  const [formData, setFormData] = useState(() => getInitialFormData(defaultValues))
  const [previewTouched, setPreviewTouched] = useState(Boolean(defaultValues.preview?.trim()))
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const prefersReducedMotion = useReducedMotion()

  const generatedSlug = useMemo(
    () => normalizeSlug(formData.slug || formData.title),
    [formData.slug, formData.title],
  )

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues))
    setPreviewTouched(Boolean(defaultValues.preview?.trim()))
    setFormError('')
    setFieldErrors({})
  }, [defaultValues])

  useEffect(() => {
    if (previewTouched || !formData.title.trim()) return

    const generatedPreview = buildPreviewFromContent(formData.content)
    if (!generatedPreview) return

    setFormData((prev) => {
      if (prev.preview === generatedPreview) return prev
      return { ...prev, preview: generatedPreview }
    })
  }, [formData.content, formData.title, previewTouched])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setFieldErrors({})

    const validation = validatePoemInput({
      ...formData,
      slug: generatedSlug,
      preview: formData.preview.trim() || buildPreviewFromContent(formData.content),
    })

    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors)
      setFormError(validation.error.message)
      return
    }

    setSubmitting(true)

    try {
      const result = await onSubmit(validation.values)

      if (result?.error) {
        setFieldErrors(result.fieldErrors || {})
        setFormError(result.error.message || 'Save failed. Please try again.')
        return
      }
    } catch (error) {
      setFormError(error?.message || 'Save failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="poem-form" onSubmit={handleSubmit} noValidate>
      <div className="poem-form-header">
        <h2>{formData.id ? 'Edit poem' : 'Write a new poem'}</h2>
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
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? 'poem-title-error' : undefined}
            disabled={submitting}
          />
          {fieldErrors.title ? (
            <span className="field-error" id="poem-title-error">
              {fieldErrors.title}
            </span>
          ) : null}
        </label>
        <label>
          Slug
          <input
            value={formData.slug}
            onChange={(event) => updateField('slug', event.target.value)}
            placeholder={generatedSlug || 'auto-generated if empty'}
            aria-invalid={Boolean(fieldErrors.slug)}
            aria-describedby={fieldErrors.slug ? 'poem-slug-error' : 'poem-slug-help'}
            disabled={submitting}
          />

          {fieldErrors.slug ? (
            <span className="field-error" id="poem-slug-error">
              {fieldErrors.slug}
            </span>
          ) : null}
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
          aria-invalid={Boolean(fieldErrors.preview)}
          aria-describedby={fieldErrors.preview ? 'poem-preview-error' : undefined}
          disabled={submitting}
        />
        {fieldErrors.preview ? (
          <span className="field-error" id="poem-preview-error">
            {fieldErrors.preview}
          </span>
        ) : null}
      </label>
      <label>
        Poem
        <textarea
          rows={14}
          value={formData.content}
          onChange={(event) => updateField('content', event.target.value)}
          placeholder="Write the full poem here"
          required
          aria-invalid={Boolean(fieldErrors.content)}
          aria-describedby={fieldErrors.content ? 'poem-content-error' : undefined}
          disabled={submitting}
        />
        {fieldErrors.content ? (
          <span className="field-error" id="poem-content-error">
            {fieldErrors.content}
          </span>
        ) : null}
      </label>
      <label className="checkbox-row checkbox-card">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(event) => updateField('published', event.target.checked)}
          disabled={submitting}
        />
        <span>
          <strong>Published</strong>
          <small>Visible on the public site when enabled</small>
        </span>
      </label>
      {formError ? (
        <p className="error-text" role="alert">
          {formError}
        </p>
      ) : null}
      <MotionButton
        className="poem-form-submit"
        type="submit"
        disabled={submitting}
        whileHover={prefersReducedMotion || submitting ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion || submitting ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {submitting ? 'Saving...' : submitLabel}
      </MotionButton>
    </form>
  )
}

export default PoemForm
