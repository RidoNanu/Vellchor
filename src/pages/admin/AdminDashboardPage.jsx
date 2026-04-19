import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import DashboardList from '../../components/admin/DashboardList'
import { formatDate } from '../../utils/text'
import { deletePoem, fetchAdminPoems } from '../../services/poemService'

function AdminDashboardPage() {
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [sortMode, setSortMode] = useState('updated-desc')
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: prefersReducedMotion
      ? {}
      : {
          transition: {
            staggerChildren: 0.07,
            delayChildren: 0.04,
          },
        },
  }

  const fadeUpVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  async function loadPoems() {
    const { data, error: fetchError } = await fetchAdminPoems()

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPoems(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadPoems()
  }, [])

  async function handleDelete(id) {
    const { error: deleteError } = await deletePoem(id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await loadPoems()
  }

  const filteredPoems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const filtered = poems.filter((poem) => {
      const haystack = `${poem.title ?? ''} ${poem.slug ?? ''} ${poem.preview ?? ''} ${poem.content ?? ''}`.toLowerCase()
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch)

      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'published' && Boolean(poem.published)) ||
        (visibilityFilter === 'draft' && !poem.published)

      return matchesSearch && matchesVisibility
    })

    return [...filtered].sort((firstPoem, secondPoem) => {
      switch (sortMode) {
        case 'updated-asc':
          return new Date(firstPoem.updated_at || firstPoem.created_at || 0) -
            new Date(secondPoem.updated_at || secondPoem.created_at || 0)
        case 'title-asc':
          return (firstPoem.title || '').localeCompare(secondPoem.title || '')
        case 'title-desc':
          return (secondPoem.title || '').localeCompare(firstPoem.title || '')
        case 'updated-desc':
        default:
          return new Date(secondPoem.updated_at || secondPoem.created_at || 0) -
            new Date(firstPoem.updated_at || firstPoem.created_at || 0)
      }
    })
  }, [poems, searchTerm, sortMode, visibilityFilter])

  const latestUpdatedAt = poems[0]?.updated_at || poems[0]?.created_at
  const hasFilters =
    searchTerm.trim().length > 0 || visibilityFilter !== 'all' || sortMode !== 'updated-desc'

  return (
    <motion.section
      className="admin-page"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={containerVariants}
    >
      <motion.h1 variants={fadeUpVariants}>Dashboard</motion.h1>
      <motion.div className="admin-stats" variants={containerVariants}>
        <motion.article variants={fadeUpVariants}>
          <span>Total poems</span>
          <strong>{poems.length}</strong>
        </motion.article>
        <motion.article variants={fadeUpVariants}>
          <span>Latest update</span>
          <strong>{latestUpdatedAt ? formatDate(latestUpdatedAt) : '—'}</strong>
        </motion.article>
      </motion.div>

      <motion.div className="admin-filters" variants={fadeUpVariants}>
        <label className="admin-filter admin-filter-search">
          <span>Search poem</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, slug, or lines"
          />
        </label>
        <label className="admin-filter">
          <span>Visibility</span>
          <select
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="admin-filter">
          <span>Sort</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
          >
            <option value="updated-desc">Latest updated</option>
            <option value="updated-asc">Oldest updated</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </label>
      </motion.div>

      {!loading && !error ? (
        <motion.p className="admin-filter-meta status-text" variants={fadeUpVariants}>
          {filteredPoems.length} {filteredPoems.length === 1 ? 'poem' : 'poems'} shown
          {hasFilters ? ' after filtering' : ''}
        </motion.p>
      ) : null}

      {loading ? (
        <motion.p className="status-text admin-state" variants={fadeUpVariants}>
          Loading poems...
        </motion.p>
      ) : null}
      {error ? (
        <motion.p className="error-text admin-state" variants={fadeUpVariants}>
          {error}
        </motion.p>
      ) : null}
      {!loading && !error ? <DashboardList poems={filteredPoems} onDelete={handleDelete} /> : null}
    </motion.section>
  )
}

export default AdminDashboardPage
