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
  return supabase
    .from(POEMS_TABLE)
    .select('*')
    .eq('slug', slug)
    .single()
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
