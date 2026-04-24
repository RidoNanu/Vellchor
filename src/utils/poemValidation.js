import { VALIDATION } from '../config/constants'
import { AppError } from './appErrors'

export function normalizeSlug(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildPreviewFromContent(content = '') {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join('\n')
}

function addFieldError(fieldErrors, field, message) {
  if (!fieldErrors[field]) {
    fieldErrors[field] = message
  }
}

export function validatePoemInput(values = {}) {
  const title = (values.title || '').trim()
  const content = (values.content || '').trim()
  const preview = (values.preview || '').trim() || buildPreviewFromContent(content)
  const slug = normalizeSlug(values.slug || title)
  const fieldErrors = {}

  if (title.length < VALIDATION.MIN_TITLE_LENGTH) {
    addFieldError(fieldErrors, 'title', 'Title is required.')
  }

  if (title.length > VALIDATION.MAX_TITLE_LENGTH) {
    addFieldError(
      fieldErrors,
      'title',
      `Title must be ${VALIDATION.MAX_TITLE_LENGTH} characters or fewer.`,
    )
  }

  if (content.length < VALIDATION.MIN_CONTENT_LENGTH) {
    addFieldError(fieldErrors, 'content', 'Poem content is required.')
  }

  if (preview.length < VALIDATION.MIN_PREVIEW_LENGTH) {
    addFieldError(fieldErrors, 'preview', 'Preview is required.')
  }

  if (!slug) {
    addFieldError(fieldErrors, 'slug', 'Slug is required.')
  } else if (slug.length > VALIDATION.MAX_SLUG_LENGTH) {
    addFieldError(
      fieldErrors,
      'slug',
      `Slug must be ${VALIDATION.MAX_SLUG_LENGTH} characters or fewer.`,
    )
  } else if (!VALIDATION.SLUG_PATTERN.test(slug)) {
    addFieldError(
      fieldErrors,
      'slug',
      'Slug can contain only lowercase letters, numbers, and single hyphens.',
    )
  }

  const errorMessages = Object.values(fieldErrors)

  return {
    isValid: errorMessages.length === 0,
    fieldErrors,
    error: errorMessages.length ? new AppError(errorMessages[0]) : null,
    values: {
      ...values,
      title,
      content,
      preview,
      slug,
      published: Boolean(values.published),
    },
  }
}

export function validateCommentInput(values = {}) {
  const content = (values.content || '').trim()
  const name = (values.name || '').trim()
  const fieldErrors = {}

  if (!values.poem_id) {
    addFieldError(fieldErrors, 'poem_id', 'Poem is required before posting a comment.')
  }

  if (content.length < VALIDATION.MIN_COMMENT_LENGTH) {
    addFieldError(fieldErrors, 'content', 'Comment cannot be empty.')
  }

  if (content.length > VALIDATION.MAX_COMMENT_LENGTH) {
    addFieldError(
      fieldErrors,
      'content',
      `Comment must be ${VALIDATION.MAX_COMMENT_LENGTH} characters or fewer.`,
    )
  }

  const errorMessages = Object.values(fieldErrors)

  return {
    isValid: errorMessages.length === 0,
    fieldErrors,
    error: errorMessages.length ? new AppError(errorMessages[0]) : null,
    values: {
      ...values,
      name,
      content,
    },
  }
}
