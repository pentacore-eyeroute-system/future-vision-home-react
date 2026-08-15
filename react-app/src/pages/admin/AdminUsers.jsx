function AdminUsers() {
  return (
    <div className="admin-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2>User Management</h2>
          <p>Review sign-up requests, assign roles, and manage system accounts.</p>
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          User & Access Management
        </h3>
        <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>
          Manage user accounts, review pending sign-ups, and configure editor and administrator permissions.
        </p>
      </div>
    </div>
  )
}

export default AdminUsers
