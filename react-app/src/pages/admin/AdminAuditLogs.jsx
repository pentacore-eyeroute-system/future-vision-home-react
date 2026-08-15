function AdminAuditLogs() {
  return (
    <div className="admin-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2>Audit Logs</h2>
          <p>Track administrator actions, content edits, and system events.</p>
        </div>
      </div>

      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'var(--bg-secondary, #f8fafc)',
        borderRadius: '8px',
        border: '1px dashed var(--border-color, #e2e8f0)',
        color: 'var(--text-secondary, #64748b)'
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: '0 auto 1rem auto', opacity: 0.7 }}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Activity & Audit Logs
        </h3>
        <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>
          Real-time logs of system modifications, content changes, and user authentication events.
        </p>
      </div>
    </div>
  )
}

export default AdminAuditLogs
