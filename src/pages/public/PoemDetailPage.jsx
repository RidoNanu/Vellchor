import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PoemViewer from '../../components/poem/PoemViewer'
import CommentList from '../../components/common/CommentList'
import CommentForm from '../../components/common/CommentForm'
import {
  addComment,
  fetchCommentsByPoemId,
  fetchPoemBySlug,
} from '../../services/poemService'
import { TIMEOUTS } from '../../config/constants'
import { wait } from '../../utils/request'
import { useViewTracker } from '../../hooks/useViewTracker'
import { PoemDetailSkeleton } from '../../components/common/Skeletons'

const MotionSection = motion.section
const MotionDiv = motion.div

function PoemDetailPage() {
  const { slug } = useParams()
  const location = useLocation()
  const poemState = location.state?.poem
  const prefersReducedMotion = useReducedMotion()
  const [poem, setPoem] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState('')
  const [commentsError, setCommentsError] = useState('')
  const mountedRef = useRef(false)
  const poemRequestIdRef = useRef(0)
  const commentsRequestIdRef = useRef(0)

  useViewTracker(poem?.id)

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.36,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const loadComments = useCallback(async (poemId, { showLoader = true } = {}) => {
    const currentRequestId = commentsRequestIdRef.current + 1
    commentsRequestIdRef.current = currentRequestId

    if (showLoader) {
      setCommentsLoading(true)
    }
    setCommentsError('')

    try {
      const { data, error: fetchError } = await fetchCommentsByPoemId(poemId)

      if (!mountedRef.current || currentRequestId !== commentsRequestIdRef.current) {
        return
      }

      if (fetchError) {
        setComments([])
        setCommentsError(fetchError.message || 'Could not load comments. Please try again.')
        return
      }

      setComments(data || [])
      setCommentsError('')
    } catch (loadError) {
      if (!mountedRef.current || currentRequestId !== commentsRequestIdRef.current) {
        return
      }

      setComments([])
      setCommentsError(loadError?.message || 'Could not load comments. Please try again.')
    } finally {
      if (mountedRef.current && currentRequestId === commentsRequestIdRef.current) {
        setCommentsLoading(false)
      }
    }
  }, [])

  const loadPoem = useCallback(async () => {
    const currentRequestId = poemRequestIdRef.current + 1
    poemRequestIdRef.current = currentRequestId

    setLoading(true)
    setCommentsLoading(true)
    setError('')
    setCommentsError('')

    try {
      const { data, error: fetchError } = await fetchPoemBySlug(slug)

      if (!mountedRef.current || currentRequestId !== poemRequestIdRef.current) {
        return
      }

      if (fetchError) {
        setPoem(null)
        setComments([])
        setCommentsLoading(false)
        setError(fetchError.message || 'Could not load poem. Please try again.')
        return
      }

      if (!data) {
        setPoem(null)
        setComments([])
        setCommentsLoading(false)
        setError('Poem not found or not published.')
        return
      }

      setPoem(data)
      setError('')
      loadComments(data.id)
    } catch (loadError) {
      if (!mountedRef.current || currentRequestId !== poemRequestIdRef.current) {
        return
      }

      setPoem(null)
      setComments([])
      setCommentsLoading(false)
      setError(loadError?.message || 'Could not load poem. Please try again.')
    } finally {
      if (mountedRef.current && currentRequestId === poemRequestIdRef.current) {
        setLoading(false)
      }
    }
  }, [loadComments, slug])

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

  async function handleCommentSubmit(payload) {
    const result = await addComment(payload)

    if (!result.error) {
      await loadComments(payload.poem_id, { showLoader: false })
    }

    return result
  }

  return (
    <MotionSection
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={sectionVariants}
    >
      {loading ? <PoemDetailSkeleton /> : null}
      {error ? (
        <div className="feedback-panel">
          <p className="error-text">{error}</p>
          <button type="button" onClick={loadPoem}>
            Try again
          </button>
        </div>
      ) : null}
      {!loading && !error && poem ? (
        <>
          <MotionDiv variants={sectionVariants}>
            <PoemViewer poem={poem} />
          </MotionDiv>
          <MotionDiv variants={sectionVariants}>
            <CommentForm poemId={poem.id} onSubmit={handleCommentSubmit} />
          </MotionDiv>
          <MotionDiv variants={sectionVariants}>
            {commentsLoading ? (
              <p className="status-text">Loading comments...</p>
            ) : (
              <CommentList comments={comments} />
            )}
            {commentsError ? (
              <div className="feedback-panel">
                <p className="error-text">{commentsError}</p>
                <button type="button" onClick={() => loadComments(poem.id)}>
                  Reload comments
                </button>
              </div>
            ) : null}
          </MotionDiv>
        </>
      ) : null}
    </MotionSection>
  )
}

export default PoemDetailPage
