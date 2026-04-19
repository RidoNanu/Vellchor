import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PoemViewer from '../../components/poem/PoemViewer'
import CommentList from '../../components/common/CommentList'
import CommentForm from '../../components/common/CommentForm'
import {
  addComment,
  fetchCommentsByPoemId,
  fetchPoemBySlug,
} from '../../services/poemService'

function PoemDetailPage() {
  const { slug } = useParams()
  const prefersReducedMotion = useReducedMotion()
  const [poem, setPoem] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms)
      }),
    ])
  }

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

  async function loadComments(poemId) {
    const { data } = await fetchCommentsByPoemId(poemId)
    setComments(data || [])
  }

  useEffect(() => {
    async function loadPoem() {
      setLoading(true)
      setError('')

      try {
        const { data, error: fetchError } = await withTimeout(
          fetchPoemBySlug(slug),
          10000,
          'Request timed out while loading the poem.',
        )

        if (fetchError) {
          setPoem(null)
          setComments([])
          setError(fetchError.message)
          return
        }

        if (!data) {
          setPoem(null)
          setComments([])
          setError('Poem not found or not published.')
          return
        }

        setPoem(data)

        // Load comments after showing the poem so a slow comments query does not block the page.
        loadComments(data.id).catch(() => {
          setComments([])
        })
      } catch (loadError) {
        setPoem(null)
        setComments([])
        setError(loadError?.message || 'Could not load poem. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadPoem()
  }, [slug])

  async function handleCommentSubmit(payload) {
    const result = await addComment(payload)

    if (!result.error) {
      await loadComments(payload.poem_id)
    }

    return result
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={sectionVariants}
    >
      {loading ? <p className="status-text">Loading poem...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && poem ? (
        <>
          <motion.div variants={sectionVariants}>
            <PoemViewer poem={poem} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <CommentForm poemId={poem.id} onSubmit={handleCommentSubmit} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <CommentList comments={comments} />
          </motion.div>
        </>
      ) : null}
    </motion.section>
  )
}

export default PoemDetailPage
