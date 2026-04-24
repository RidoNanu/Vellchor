import { API, RETRY, TIMEOUTS } from '../config/constants'
import { normalizeRequestError } from '../utils/appErrors'
import { validateCommentInput, validatePoemInput } from '../utils/poemValidation'
import { runWithRetry } from '../utils/request'
import { supabase } from './supabase'

function attachAbortSignal(query, signal) {
  if (signal && typeof query.abortSignal === 'function') {
    return query.abortSignal(signal)
  }

  return query
}

async function executeQuery(buildQuery, options = {}) {
  const {
    timeoutMs = TIMEOUTS.REQUEST_MS,
    retries = RETRY.REQUEST_RETRIES,
    fallbackMessage = 'Request failed. Please try again.',
  } = options

  try {
    const response = await runWithRetry(
      async (signal) => {
        const result = await attachAbortSignal(buildQuery(signal), signal)

        if (result.error) {
          throw result.error
        }

        return result
      },
      {
        timeoutMs,
        retries,
        timeoutMessage: fallbackMessage,
        fallbackMessage,
      },
    )

    return { ...response, error: null }
  } catch (error) {
    return {
      data: null,
      error: normalizeRequestError(error, fallbackMessage),
    }
  }
}

function validationFailure(validation) {
  return {
    data: null,
    error: validation.error,
    fieldErrors: validation.fieldErrors,
  }
}

async function ensureUniqueSlug(slug, currentPoemId = null) {
  const result = await executeQuery(
    () => {
      let query = supabase
        .from(API.POEMS_TABLE)
        .select('id')
        .ilike('slug', slug)
        .limit(1)

      if (currentPoemId) {
        query = query.neq('id', currentPoemId)
      }

      return query.maybeSingle()
    },
    {
      timeoutMs: TIMEOUTS.ADMIN_FETCH_MS,
      fallbackMessage: 'Could not validate the poem slug. Please try again.',
    },
  )

  if (result.error) {
    return {
      data: null,
      error: result.error,
      fieldErrors: { slug: result.error.message },
    }
  }

  if (result.data) {
    const message = 'A poem with this slug already exists. Choose a unique slug.'
    return {
      data: null,
      error: new Error(message),
      fieldErrors: { slug: message },
    }
  }

  return { data: null, error: null, fieldErrors: {} }
}

export async function fetchPublishedPoems() {
  return executeQuery(
    () =>
      supabase
        .from(API.POEMS_TABLE)
        .select('id,title,preview,slug,content,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false }),
    {
      timeoutMs: TIMEOUTS.POEM_FETCH_MS,
      fallbackMessage: 'Could not load poems. Check your connection and try again.',
    },
  )
}

export async function fetchAdminPoems() {
  return executeQuery(
    () =>
      supabase
        .from('poem_with_views')
        .select('*')
        .order('updated_at', { ascending: false }),
    {
      timeoutMs: TIMEOUTS.ADMIN_FETCH_MS,
      fallbackMessage: 'Could not load admin poems. Check your connection and try again.',
    },
  )
}

export async function fetchPoemBySlug(slug) {
  const normalizedSlug = decodeURIComponent((slug || '').trim()).toLowerCase()

  if (!normalizedSlug) {
    return {
      data: null,
      error: new Error('Poem slug is required.'),
    }
  }

  return executeQuery(
    () =>
      supabase
        .from(API.POEMS_TABLE)
        .select('id,title,preview,slug,content,created_at')
        .eq('published', true)
        .ilike('slug', normalizedSlug)
        .limit(1)
        .maybeSingle(),
    {
      timeoutMs: TIMEOUTS.POEM_FETCH_MS,
      fallbackMessage: 'Could not load this poem. Check your connection and try again.',
    },
  )
}

export async function fetchPoemById(id) {
  if (!id) {
    return {
      data: null,
      error: new Error('Poem ID is required.'),
    }
  }

  return executeQuery(
    () =>
      supabase
        .from(API.POEMS_TABLE)
        .select('*')
        .eq('id', id)
        .single(),
    {
      timeoutMs: TIMEOUTS.ADMIN_FETCH_MS,
      fallbackMessage: 'Could not load this poem. Check your connection and try again.',
    },
  )
}

export async function fetchCommentsByPoemId(poemId) {
  if (!poemId) {
    return {
      data: null,
      error: new Error('Poem ID is required before loading comments.'),
    }
  }

  return executeQuery(
    () =>
      supabase
        .from(API.COMMENTS_TABLE)
        .select('*')
        .eq('poem_id', poemId)
        .order('created_at', { ascending: false }),
    {
      timeoutMs: TIMEOUTS.COMMENT_FETCH_MS,
      fallbackMessage: 'Could not load comments. Check your connection and try again.',
    },
  )
}

export async function addComment(comment) {
  const validation = validateCommentInput(comment)

  if (!validation.isValid) {
    return validationFailure(validation)
  }

  return executeQuery(
    () =>
      supabase
        .from(API.COMMENTS_TABLE)
        .insert([validation.values])
        .select('*')
        .single(),
    {
      timeoutMs: TIMEOUTS.COMMENT_FETCH_MS,
      fallbackMessage: 'Could not post your comment. Check your connection and try again.',
    },
  )
}

export async function recordUniqueView(poemId, deviceId) {
  if (!poemId || !deviceId) {
    return {
      data: null,
      error: new Error('Poem ID and Device ID are required.'),
    }
  }

  const result = await executeQuery(
    () =>
      supabase
        .from('poem_views')
        .insert([{ poem_id: poemId, device_id: deviceId }]),
    {
      timeoutMs: TIMEOUTS.REQUEST_MS,
      fallbackMessage: 'Could not record view. Check your connection and try again.',
    },
  )

  // Ignore unique constraint violations (23505) as they mean the view was already recorded
  if (result.error && result.error.code === '23505') {
    return { data: null, error: null }
  }

  return result
}

export async function createPoem(poem) {
  const validation = validatePoemInput(poem)

  if (!validation.isValid) {
    return validationFailure(validation)
  }

  const slugCheck = await ensureUniqueSlug(validation.values.slug)

  if (slugCheck.error) {
    return slugCheck
  }

  return executeQuery(
    () =>
      supabase
        .from(API.POEMS_TABLE)
        .insert([validation.values])
        .select('*')
        .single(),
    {
      timeoutMs: TIMEOUTS.ADMIN_FETCH_MS,
      fallbackMessage: 'Could not create the poem. Check your connection and try again.',
    },
  )
}

export async function updatePoem(id, poem) {
  if (!id) {
    return {
      data: null,
      error: new Error('Poem ID is required.'),
    }
  }

  const validation = validatePoemInput(poem)

  if (!validation.isValid) {
    return validationFailure(validation)
  }

  const slugCheck = await ensureUniqueSlug(validation.values.slug, id)

  if (slugCheck.error) {
    return slugCheck
  }

  return executeQuery(
    () =>
      supabase
        .from(API.POEMS_TABLE)
        .update(validation.values)
        .eq('id', id)
        .select('*')
        .single(),
    {
      timeoutMs: TIMEOUTS.ADMIN_FETCH_MS,
      fallbackMessage: 'Could not update the poem. Check your connection and try again.',
    },
  )
}

export async function deletePoem(id) {
  if (!id) {
    return {
      data: null,
      error: new Error('Poem ID is required.'),
    }
  }

  return executeQuery(
    () =>
      supabase
        .from(API.POEMS_TABLE)
        .delete()
        .eq('id', id),
    {
      timeoutMs: TIMEOUTS.ADMIN_FETCH_MS,
      fallbackMessage: 'Could not delete the poem. Check your connection and try again.',
    },
  )
}
