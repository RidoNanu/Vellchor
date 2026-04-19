import { supabase } from './supabase'

const POEMS_TABLE = 'poems'
const COMMENTS_TABLE = 'comments'

export async function fetchPublishedPoems() {
  return supabase
    .from(POEMS_TABLE)
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
}

export async function fetchAdminPoems() {
  return supabase
    .from(POEMS_TABLE)
    .select('*')
    .order('updated_at', { ascending: false })
}

export async function fetchPoemBySlug(slug) {
  const normalizedSlug = decodeURIComponent((slug || '').trim())

  const exactResult = await supabase
    .from(POEMS_TABLE)
    .select('*')
    .eq('published', true)
    .eq('slug', normalizedSlug)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (exactResult.data || exactResult.error) {
    return exactResult
  }

  const caseInsensitiveResult = await supabase
    .from(POEMS_TABLE)
    .select('*')
    .eq('published', true)
    .ilike('slug', normalizedSlug)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (caseInsensitiveResult.data || caseInsensitiveResult.error) {
    return caseInsensitiveResult
  }

  const { data: publishedPoems, error } = await supabase
    .from(POEMS_TABLE)
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    return { data: null, error }
  }

  const toSlugKey = (value = '') =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[_\s]+/g, '-')
      .replace(/-+/g, '-')

  const slugKey = toSlugKey(normalizedSlug)
  const fallback = (publishedPoems || []).find((poem) => toSlugKey(poem.slug) === slugKey)

  return { data: fallback || null, error: null }
}

export async function fetchPoemById(id) {
  return supabase
    .from(POEMS_TABLE)
    .select('*')
    .eq('id', id)
    .single()
}

export async function fetchCommentsByPoemId(poemId) {
  return supabase
    .from(COMMENTS_TABLE)
    .select('*')
    .eq('poem_id', poemId)
    .order('created_at', { ascending: false })
}

export async function addComment(comment) {
  return supabase
    .from(COMMENTS_TABLE)
    .insert([comment])
    .select('*')
    .single()
}

export async function createPoem(poem) {
  return supabase
    .from(POEMS_TABLE)
    .insert([poem])
    .select('*')
    .single()
}

export async function updatePoem(id, poem) {
  return supabase
    .from(POEMS_TABLE)
    .update(poem)
    .eq('id', id)
    .select('*')
    .single()
}

export async function deletePoem(id) {
  return supabase
    .from(POEMS_TABLE)
    .delete()
    .eq('id', id)
}
