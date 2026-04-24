import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import DashboardList from '../../components/admin/DashboardList'
import { AdminDashboardSkeleton } from '../../components/common/Skeletons'
import ToolbarDropdown from '../../components/common/ToolbarDropdown'
import { UI, TIMEOUTS } from '../../config/constants'
import { formatDate } from '../../utils/text'
import { wait } from '../../utils/request'
import { deletePoem, fetchAdminPoems } from '../../services/poemService'

const MotionArticle = motion.article
const MotionButton = motion.button
const MotionDiv = motion.div
const MotionH1 = motion.h1
const MotionP = motion.p
const MotionSection = motion.section

function AdminDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.notice || '')
  const [retrying, setRetrying] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [sortMode, setSortMode] = useState('updated-desc')
  const [activeMenu, setActiveMenu] = useState(null)
  const mountedRef = useRef(false)
  const requestIdRef = useRef(0)
  const successTimeoutRef = useRef(null)
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

  const showSuccess = useCallback((message) => {
    setSuccess(message)

    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current)
    }

    successTimeoutRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setSuccess('')
      }
    }, UI.SUCCESS_MESSAGE_DURATION_MS)
  }, [])

  const loadPoems = useCallback(async ({ isRetry = false } = {}) => {
    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId

    if (isRetry) {
      setRetrying(true)
    } else {
      setLoading(true)
    }
    setError('')

    try {
      const { data, error: fetchError } = await fetchAdminPoems()

      if (!mountedRef.current || currentRequestId !== requestIdRef.current) {
        return
      }

      if (fetchError) {
        setPoems([])
        setError(fetchError.message || 'Could not load poems. Please try again.')
        return
      }

      setPoems(data || [])
    } catch (loadError) {
      if (!mountedRef.current || currentRequestId !== requestIdRef.current) {
        return
      }

      setPoems([])
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
    loadPoems()

    async function handleOnline() {
      await wait(TIMEOUTS.ONLINE_RECOVERY_DELAY_MS)
      if (mountedRef.current) {
        loadPoems()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mountedRef.current = false
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current)
      }
      window.removeEventListener('online', handleOnline)
    }
  }, [loadPoems])

  useEffect(() => {
    if (!location.state?.notice) return

    showSuccess(location.state.notice)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, showSuccess])

  async function handleDelete(id) {
    setError('')
    setSuccess('')
    setDeletingId(id)

    try {
      const { error: deleteError } = await deletePoem(id)
      if (deleteError) {
        setError(deleteError.message || 'Could not delete poem. Please try again.')
        return
      }

      setPoems((prev) => prev.filter((poem) => poem.id !== id))
      showSuccess('Poem deleted.')
    } catch (deleteRequestError) {
      setError(deleteRequestError?.message || 'Delete failed. Please try again.')
    } finally {
      if (mountedRef.current) {
        setDeletingId('')
      }
    }
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
        case 'views-desc':
          return (secondPoem.views || 0) - (firstPoem.views || 0)
        case 'views-asc':
          return (firstPoem.views || 0) - (secondPoem.views || 0)
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
    <MotionSection
      className="admin-page"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={containerVariants}
    >
      <MotionH1 variants={fadeUpVariants}>Dashboard</MotionH1>
      <MotionDiv className="admin-stats" variants={containerVariants}>
        <MotionArticle variants={fadeUpVariants}>
          <span>Total poems</span>
          <strong>{poems.length}</strong>
        </MotionArticle>
        <MotionArticle variants={fadeUpVariants}>
          <span>Latest update</span>
          <strong>{latestUpdatedAt ? formatDate(latestUpdatedAt) : '-'}</strong>
        </MotionArticle>
      </MotionDiv>

      {success ? (
        <MotionDiv className="feedback-panel success-panel" variants={fadeUpVariants} role="status">
          <p className="success-text">{success}</p>
        </MotionDiv>
      ) : null}

      {error ? (
        <MotionDiv className="feedback-panel" variants={fadeUpVariants}>
          <p className="error-text">{error}</p>
          <MotionButton
            type="button"
            onClick={() => loadPoems({ isRetry: true })}
            disabled={retrying}
            whileHover={retrying ? undefined : { y: -1 }}
            whileTap={retrying ? undefined : { scale: 0.98 }}
          >
            {retrying ? 'Retrying...' : 'Try again'}
          </MotionButton>
        </MotionDiv>
      ) : null}

      <MotionDiv className="admin-filters" variants={fadeUpVariants}>
        <label className="admin-filter admin-filter-search">
          <span>Search poem</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, slug, or lines"
            disabled={loading}
          />
        </label>
        <ToolbarDropdown
          label="Visibility"
          value={visibilityFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ]}
          onChange={setVisibilityFilter}
          dropdownKey="visibility"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          disabled={loading}
        />
        <ToolbarDropdown
          label="Sort"
          value={sortMode}
          options={[
            { value: 'updated-desc', label: 'Latest updated' },
            { value: 'updated-asc', label: 'Oldest updated' },
            { value: 'views-desc', label: 'Most viewed' },
            { value: 'views-asc', label: 'Least viewed' },
            { value: 'title-asc', label: 'Title A-Z' },
            { value: 'title-desc', label: 'Title Z-A' },
          ]}
          onChange={setSortMode}
          dropdownKey="sort"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          disabled={loading}
        />
      </MotionDiv>

      {!loading && !error ? (
        <MotionP className="admin-filter-meta status-text" variants={fadeUpVariants}>
          {filteredPoems.length} {filteredPoems.length === 1 ? 'poem' : 'poems'} shown
          {hasFilters ? ' after filtering' : ''}
        </MotionP>
      ) : null}

      {loading ? <AdminDashboardSkeleton count={5} /> : null}
      {!loading && !error ? (
        <DashboardList poems={filteredPoems} onDelete={handleDelete} deletingId={deletingId} />
      ) : null}
    </MotionSection>
  )
}

export default AdminDashboardPage
