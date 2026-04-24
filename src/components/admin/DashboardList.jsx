import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const MotionList = motion.ul
const MotionItem = motion.li
const MotionLink = motion.create(Link)
const MotionButton = motion.button

function DashboardList({ poems, onDelete, deletingId = '' }) {
  const prefersReducedMotion = useReducedMotion()

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
          <div className="dashboard-info">
            <p className="dashboard-title">{poem.title}</p>
            {poem.views !== undefined && (
              <span className="dashboard-views" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #666)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {poem.views} {poem.views === 1 ? 'view' : 'views'}
              </span>
            )}
          </div>
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
              disabled={deletingId === poem.id}
              whileHover={prefersReducedMotion || deletingId === poem.id ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion || deletingId === poem.id ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              {deletingId === poem.id ? 'Deleting...' : 'Delete'}
            </MotionButton>
          </div>
        </MotionItem>
      ))}
    </MotionList>
  )
}

export default DashboardList
