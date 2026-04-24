import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import PoemList from '../../components/poem/PoemList'
import { PoemListSkeleton } from '../../components/common/Skeletons'
import ToolbarDropdown from '../../components/common/ToolbarDropdown'
import { TIMEOUTS } from '../../config/constants'
import { fetchPublishedPoems } from '../../services/poemService'
import { wait } from '../../utils/request'

const MotionSection = motion.section

const POEMS_CACHE_KEY = 'vellichor:poems:list:v1'

function readPoemsCache() {
  try {
    const raw = localStorage.getItem(POEMS_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function writePoemsCache(poems) {
  try {
    localStorage.setItem(POEMS_CACHE_KEY, JSON.stringify(poems))
  } catch {
    // Ignore cache write failures (private mode/quota) and keep network data flow.
  }
}

const readingModeOptions = [
  { value: 'all', label: 'All lengths' },
  { value: 'short', label: 'Short (< 10 lines)' },
  { value: 'medium', label: 'Medium (10 - 30 lines)' },
  { value: 'long', label: 'Long (> 30 lines)' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
]



function PoemsPage() {
  const prefersReducedMotion = useReducedMotion()
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [readingMode, setReadingMode] = useState('all')
  const [sortMode, setSortMode] = useState('newest')
  const [activeMenu, setActiveMenu] = useState(null)
  const mountedRef = useRef(false)
  const requestIdRef = useRef(0)

  const loadPoems = useCallback(async ({ isRetry = false, useCache = false } = {}) => {
    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId

    setError('')

    if (isRetry) {
      setRetrying(true)
    } else if (useCache) {
      const cachedPoems = readPoemsCache()
      if (cachedPoems.length) {
        setPoems(cachedPoems)
        setLoading(false)
      } else {
        setLoading(true)
      }
    } else {
      setLoading(true)
    }

    try {
      const { data, error: fetchError } = await fetchPublishedPoems()

      if (!mountedRef.current || currentRequestId !== requestIdRef.current) {
        return
      }

      if (fetchError) {
        const cachedPoems = readPoemsCache()
        if (!cachedPoems.length) {
          setPoems([])
        }
        setError(fetchError.message || 'Could not load poems. Please try again.')
        return
      }

      const freshPoems = data || []
      setPoems(freshPoems)
      writePoemsCache(freshPoems)
    } catch (loadError) {
      if (!mountedRef.current || currentRequestId !== requestIdRef.current) {
        return
      }

      const cachedPoems = readPoemsCache()
      if (!cachedPoems.length) {
        setPoems([])
      }
      setError(loadError?.message || 'Could not load poems. Please try again.')
    } finally {
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setLoading(false)
        setRetrying(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    loadPoems({ useCache: true })

    async function handleOnline() {
      await wait(TIMEOUTS.ONLINE_RECOVERY_DELAY_MS)
      if (mountedRef.current) {
        loadPoems()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
    }
  }, [loadPoems])

  const filteredPoems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const filtered = poems.filter((poem) => {
      const content = `${poem.title ?? ''} ${poem.preview ?? ''} ${poem.slug ?? ''}`.toLowerCase()
      const matchesSearch = !normalizedSearch || content.includes(normalizedSearch)

      const lineCount = (poem.content || '').split('\n').length
      const matchesReadingMode =
        readingMode === 'all' ||
        (readingMode === 'short' && lineCount < 10) ||
        (readingMode === 'medium' && lineCount >= 10 && lineCount <= 30) ||
        (readingMode === 'long' && lineCount > 30)

      return matchesSearch && matchesReadingMode
    })
    const getLength = (poem) => (poem.preview || '').trim().length

    return [...filtered].sort((firstPoem, secondPoem) => {
      switch (sortMode) {
        case 'oldest':
          return poems.indexOf(secondPoem) - poems.indexOf(firstPoem)
        case 'title-asc':
          return (firstPoem.title || '').localeCompare(secondPoem.title || '')
        case 'title-desc':
          return (secondPoem.title || '').localeCompare(firstPoem.title || '')
        case 'shortest':
          return getLength(firstPoem) - getLength(secondPoem)
        case 'longest':
          return getLength(secondPoem) - getLength(firstPoem)
        case 'newest':
        default:
          return poems.indexOf(firstPoem) - poems.indexOf(secondPoem)
      }
    })
  }, [poems, readingMode, searchTerm, sortMode])

  const hasFilters = searchTerm.trim().length > 0 || readingMode !== 'all' || sortMode !== 'newest'

  return (
    <MotionSection
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="page-title">Poems</h1>
      <div className="poems-toolbar">
        <label className="poems-search">
          <span>Search poems</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, line, or feeling"
          />
        </label>
        <ToolbarDropdown
          label="Reading mode"
          value={readingMode}
          options={readingModeOptions}
          onChange={setReadingMode}
          dropdownKey="reading-mode"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
        <ToolbarDropdown
          label="Sort poems"
          value={sortMode}
          options={sortOptions}
          onChange={setSortMode}
          dropdownKey="sort-mode"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>
      {!loading && !error ? (
        <p className="poems-results-count">
          {filteredPoems.length} {filteredPoems.length === 1 ? 'poem' : 'poems'} shown
          {hasFilters ? ' after filtering' : ''}
        </p>
      ) : null}
      {loading ? <PoemListSkeleton count={6} /> : null}
      {error ? (
        <div className="feedback-panel">
          <p className="error-text">{error}</p>
          <button
            type="button"
            onClick={() => loadPoems({ isRetry: true })}
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Try again'}
          </button>
        </div>
      ) : null}
      {!loading && !error ? (
        <PoemList
          poems={filteredPoems}
          emptyMessage={
            hasFilters
              ? 'No poems match your search, filters, or sort order. Try a broader view.'
              : undefined
          }
        />
      ) : null}
    </MotionSection>
  )
}

export default PoemsPage
