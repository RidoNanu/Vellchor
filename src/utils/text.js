export function excerpt(content = '', length = 160) {
  const clean = content.replace(/\s+/g, ' ').trim()
  if (clean.length <= length) return clean
  return `${clean.slice(0, length).trim()}...`
}

export function formatDate(dateString) {
  if (!dateString) return ''

  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
