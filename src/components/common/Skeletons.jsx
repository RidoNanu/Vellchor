function SkeletonLine({ width = '100%', className = '' }) {
  return <span className={`skeleton-line ${className}`.trim()} style={{ width }} aria-hidden="true" />
}

export function AdminDashboardSkeleton({ count = 4 }) {
  return (
    <div className="admin-dashboard-skeleton" aria-hidden="true">
      <ul className="dashboard-list dashboard-list-skeleton">
        {Array.from({ length: count }).map((_, index) => (
          <li key={index}>
            <div className="dashboard-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
              <SkeletonLine width="62%" className="skeleton-title" />
              <SkeletonLine width="15%" style={{ height: '0.85rem' }} />
            </div>
            <div className="dashboard-actions">
              <SkeletonLine width="4.75rem" className="skeleton-chip" />
              <SkeletonLine width="4.75rem" className="skeleton-chip" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AdminPoemFormSkeleton() {
  return (
    <section className="admin-form-skeleton" aria-hidden="true">
      <div className="poem-form-header">
        <SkeletonLine width="22%" className="skeleton-title" />
        <SkeletonLine width="88%" />
      </div>

      <div className="poem-form" role="presentation">
        <div className="poem-form-grid">
          <div className="skeleton-label-group">
            <SkeletonLine width="28%" />
            <SkeletonLine width="100%" className="skeleton-input" />
          </div>
          <div className="skeleton-label-group">
            <SkeletonLine width="24%" />
            <SkeletonLine width="100%" className="skeleton-input" />
          </div>
        </div>

        <div className="skeleton-label-group">
          <SkeletonLine width="16%" />
          <SkeletonLine width="100%" className="skeleton-input skeleton-textarea-short" />
        </div>

        <div className="skeleton-label-group">
          <SkeletonLine width="13%" />
          <SkeletonLine width="100%" className="skeleton-input skeleton-textarea" />
        </div>

        <div className="checkbox-row checkbox-card skeleton-checkbox-card" role="presentation">
          <SkeletonLine width="1.1rem" className="skeleton-checkbox" />
          <div className="skeleton-checkbox-copy">
            <SkeletonLine width="7.2rem" />
            <SkeletonLine width="12rem" />
          </div>
        </div>

        <SkeletonLine width="8.5rem" className="skeleton-button" />
      </div>
    </section>
  )
}

export function PoemListSkeleton({ count = 6 }) {
  return (
    <div className="poem-list poem-list-skeleton" aria-hidden="true" style={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="poem-card poem-card-skeleton" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
          <SkeletonLine width={`${50 + (index % 3) * 10}%`} className="skeleton-title" style={{ height: '1.75rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', opacity: 0.8 }}>
            <SkeletonLine width="95%" style={{ height: '1rem' }} />
            <SkeletonLine width="85%" style={{ height: '1rem' }} />
            <SkeletonLine width={`${40 + (index % 2) * 20}%`} style={{ height: '1rem' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PoemDetailSkeleton() {
  const stanzas = [
    ['65%', '85%', '70%', '45%'],
    ['75%', '60%', '80%', '55%'],
    ['60%', '90%', '50%', '35%']
  ]

  return (
    <article className="poem-viewer poem-viewer-skeleton" aria-hidden="true" style={{ maxWidth: '42rem', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '4rem' }}>
         <SkeletonLine width="45%" className="skeleton-title" style={{ height: '2.5rem', marginBottom: '1.25rem' }} />
         <SkeletonLine width="20%" className="skeleton-meta" style={{ height: '1rem', opacity: 0.6 }} />
      </header>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        {stanzas.map((lines, index) => (
          <div key={index} style={{ opacity: 0.75, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
             {lines.map((lineWidth, lineIndex) => (
               <SkeletonLine key={lineIndex} width={lineWidth} style={{ height: '1.15rem' }} />
             ))}
          </div>
        ))}
      </div>
    </article>
  )
}
