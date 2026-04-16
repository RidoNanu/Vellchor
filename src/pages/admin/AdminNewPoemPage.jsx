import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PoemForm from '../../components/admin/PoemForm'
import { createPoem } from '../../services/poemService'

function AdminNewPoemPage() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  async function handleCreate(values) {
    const result = await createPoem(values)

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
      <h1>New Poem</h1>
      <PoemForm onSubmit={handleCreate} submitLabel="Create poem" />
    </motion.section>
  )
}

export default AdminNewPoemPage
