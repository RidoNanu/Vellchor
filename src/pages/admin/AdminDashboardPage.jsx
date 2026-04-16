import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import DashboardList from '../../components/admin/DashboardList'
import { formatDate } from '../../utils/text'
import { deletePoem, fetchAdminPoems } from '../../services/poemService'

function AdminDashboardPage() {
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const latestUpdatedAt = poems[0]?.updated_at || poems[0]?.created_at

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
      {!loading && !error ? <DashboardList poems={poems} onDelete={handleDelete} /> : null}
    </motion.section>
  )
}

export default AdminDashboardPage
