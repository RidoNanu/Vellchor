import { createClient } from '@supabase/supabase-js'

const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

function readEnvValue(name) {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

const env = REQUIRED_ENV.reduce((values, name) => {
  values[name] = readEnvValue(name)
  return values
}, {})

const missingEnv = REQUIRED_ENV.filter((name) => !env[name])

if (missingEnv.length) {
  throw new Error(
    `Missing required Supabase environment variable${missingEnv.length > 1 ? 's' : ''}: ${missingEnv.join(', ')}. ` +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before starting the app.',
  )
}

let parsedSupabaseUrl

try {
  parsedSupabaseUrl = new URL(env.VITE_SUPABASE_URL)
} catch {
  throw new Error('VITE_SUPABASE_URL must be a valid Supabase project URL.')
}

if (!['https:', 'http:'].includes(parsedSupabaseUrl.protocol)) {
  throw new Error('VITE_SUPABASE_URL must start with https:// or http:// for local development.')
}

const allowedHttpHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

if (parsedSupabaseUrl.protocol === 'http:' && !allowedHttpHosts.has(parsedSupabaseUrl.hostname)) {
  throw new Error('VITE_SUPABASE_URL must use https:// outside local development.')
}

if (env.VITE_SUPABASE_ANON_KEY.length < 20) {
  throw new Error('VITE_SUPABASE_ANON_KEY is too short to be a valid anon key.')
}

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})
