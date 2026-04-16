import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

function DashboardList({ poems, onDelete }) {
  const prefersReducedMotion = useReducedMotion()
  const MotionList = motion.ul
  const MotionItem = motion.li
  const MotionLink = motion.create(Link)
  const MotionButton = motion.button

  const listVariants = {
    hidden: {},
    visible: prefersReducedMotion
      ? {}
      : {
          transition: {
            staggerChildren: 0.05,
          },
        },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  if (!poems.length) {
    return (
      <div className="admin-empty-state">
        <p className="admin-empty-title">No poems yet</p>
        <p className="status-text">Create the first piece to start shaping the collection.</p>
      </div>
    )
  }

  return (
    <MotionList className="dashboard-list" initial="hidden" animate="visible" variants={listVariants}>
      {poems.map((poem) => (
        <MotionItem
          key={poem.id}
          variants={itemVariants}
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <p className="dashboard-title">{poem.title}</p>
          <div className="dashboard-actions">
            <MotionLink
              className="dashboard-link"
              to={`/admin/edit/${poem.id}`}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              Edit
            </MotionLink>
            <MotionButton
              type="button"
              className="dashboard-delete"
              onClick={() => onDelete(poem.id)}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              Delete
            </MotionButton>
          </div>
        </MotionItem>
      ))}
    </MotionList>
  )
}

export default DashboardList
