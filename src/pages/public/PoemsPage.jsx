import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import PoemList from '../../components/poem/PoemList'
import { fetchPublishedPoems } from '../../services/poemService'

const readingModeOptions = [
  { value: 'all', label: 'All poems' },
  { value: 'short', label: 'Short reads' },
  { value: 'medium', label: 'Balanced reads' },
  { value: 'long', label: 'Long reads' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'shortest', label: 'Shortest first' },
  { value: 'longest', label: 'Longest first' },
]

function ToolbarDropdown({ label, value, options, onChange, dropdownKey, activeMenu, setActiveMenu }) {
  const containerRef = useRef(null)
  const activeOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    if (activeMenu === dropdownKey) {
      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [activeMenu, dropdownKey, setActiveMenu])

  return (
    <div className="poems-dropdown" ref={containerRef}>
      <span>{label}</span>
      <button
        type="button"
        className="poems-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={activeMenu === dropdownKey}
        onClick={() =>
          setActiveMenu((current) => (current === dropdownKey ? null : dropdownKey))
        }
      >
        <span>{activeOption.label}</span>
      </button>
      {activeMenu === dropdownKey ? (
        <ul className="poems-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={option.value === value ? 'is-active' : ''}
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value)
                  setActiveMenu(null)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function PoemsPage() {
  const prefersReducedMotion = useReducedMotion()
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [readingMode, setReadingMode] = useState('all')
  const [sortMode, setSortMode] = useState('newest')
  const [activeMenu, setActiveMenu] = useState(null)

  useEffect(() => {
    async function loadPoems() {
      const { data, error: fetchError } = await fetchPublishedPoems()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setPoems(data || [])
      }

      setLoading(false)
    }

    loadPoems()
  }, [])

  const filteredPoems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const filtered = poems.filter((poem) => {
      const content = `${poem.title ?? ''} ${poem.preview ?? ''} ${poem.content ?? ''}`.toLowerCase()
      const matchesSearch = !normalizedSearch || content.includes(normalizedSearch)

      const bodyLength = (poem.content || poem.preview || '').trim().length
      const matchesReadingMode =
        readingMode === 'all' ||
        (readingMode === 'short' && bodyLength < 500) ||
        (readingMode === 'medium' && bodyLength >= 500 && bodyLength < 1200) ||
        (readingMode === 'long' && bodyLength >= 1200)

      return matchesSearch && matchesReadingMode
    })
    const getLength = (poem) => (poem.content || poem.preview || '').trim().length

    return [...filtered].sort((firstPoem, secondPoem) => {
      switch (sortMode) {
        case 'oldest':
          return new Date(firstPoem.created_at || 0) - new Date(secondPoem.created_at || 0)
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
          return new Date(secondPoem.created_at || 0) - new Date(firstPoem.created_at || 0)
      }
    })
  }, [poems, readingMode, searchTerm, sortMode])

  const hasFilters = searchTerm.trim().length > 0 || readingMode !== 'all' || sortMode !== 'newest'

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
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
      {loading ? <p className="status-text">Loading poems...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
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
    </motion.section>
  )
}

export default PoemsPage
