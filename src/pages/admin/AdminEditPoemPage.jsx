import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PoemForm from '../../components/admin/PoemForm'
import { AdminPoemFormSkeleton } from '../../components/common/Skeletons'
import { TIMEOUTS } from '../../config/constants'
import { wait } from '../../utils/request'
import { fetchPoemById, updatePoem } from '../../services/poemService'

const MotionSection = motion.section

function AdminEditPoemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [defaultValues, setDefaultValues] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')
  const mountedRef = useRef(false)
  const requestIdRef = useRef(0)

  const loadPoem = useCallback(async ({ isRetry = false } = {}) => {
    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId

    if (isRetry) {
      setRetrying(true)
    } else {
      setLoading(true)
    }
    setError('')

    try {
      const { data, error: fetchError } = await fetchPoemById(id)

      if (!mountedRef.current || currentRequestId !== requestIdRef.current) {
        return
      }

      if (fetchError) {
        setDefaultValues(null)
        setError(fetchError.message || 'Could not load poem. Please try again.')
        return
      }

      setDefaultValues(data)
    } catch (loadError) {
      if (!mountedRef.current || currentRequestId !== requestIdRef.current) {
        return
      }

      setDefaultValues(null)
      setError(loadError?.message || 'Could not load poem. Please try again.')
    } finally {
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setLoading(false)
        setRetrying(false)
      }
    }
  }, [id])

  useEffect(() => {
    mountedRef.current = true
    loadPoem()

    async function handleOnline() {
      await wait(TIMEOUTS.ONLINE_RECOVERY_DELAY_MS)
      if (mountedRef.current) {
        loadPoem()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
    }
  }, [loadPoem])

  async function handleUpdate(values) {
    const result = await updatePoem(id, values)

    if (!result.error) {
      navigate('/admin/dashboard', { state: { notice: 'Poem updated.' } })
    }

    return result
  }

  return (
    <MotionSection
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1>Edit Poem</h1>
      {error ? (
        <div className="feedback-panel">
          <p className="error-text">{error}</p>
          <button type="button" onClick={() => loadPoem({ isRetry: true })} disabled={retrying}>
            {retrying ? 'Retrying...' : 'Try again'}
          </button>
        </div>
      ) : null}
      {loading ? <AdminPoemFormSkeleton /> : null}
      {!loading && defaultValues ? (
        <PoemForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
          submitLabel="Update poem"
        />
      ) : null}
    </MotionSection>
  )
}

export default AdminEditPoemPage
