import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PoemForm from '../../components/admin/PoemForm'
import { fetchPoemById, updatePoem } from '../../services/poemService'

function AdminEditPoemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [defaultValues, setDefaultValues] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPoem() {
      const { data, error: fetchError } = await fetchPoemById(id)

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setDefaultValues(data)
    }

    loadPoem()
  }, [id])

  async function handleUpdate(values) {
    const result = await updatePoem(id, values)

    if (!result.error) {
      navigate('/admin/dashboard')
    }

    return result
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1>Edit Poem</h1>
      {error ? <p className="error-text">{error}</p> : null}
      {defaultValues ? (
        <PoemForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
          submitLabel="Update poem"
        />
      ) : (
        <p className="status-text">Loading poem...</p>
      )}
    </motion.section>
  )
}

export default AdminEditPoemPage
