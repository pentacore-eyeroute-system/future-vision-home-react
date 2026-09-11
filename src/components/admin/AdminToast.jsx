import React from 'react'

/**
 * Reusable Admin Toast banner component for displaying success, error, and info messages.
 *
 * @param {object} props
 * @param {{ message: string, type?: 'success'|'error'|'info' } | null} props.toast - Toast data object
 * @param {function} [props.onClose] - Optional callback when toast is closed/dismissed
 */
export default function AdminToast({ toast, onClose }) {
  if (!toast || !toast.message) return null

  const isError = toast.type === 'error'
  const isInfo = toast.type === 'info'

  return (
    <div
      className={`user-toast-banner ${isError ? 'error' : isInfo ? 'info' : 'success'}`}
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          {isError ? (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          ) : isInfo ? (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </>
          ) : (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          )}
        </svg>
        <span style={{ wordBreak: 'break-word' }}>{toast.message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px 6px',
            fontSize: '1.2rem',
            lineHeight: 1,
            opacity: 0.7,
            borderRadius: '4px',
            flexShrink: 0,
            transition: 'opacity 0.2s',
          }}
          aria-label="Dismiss notification"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          &times;
        </button>
      )}
    </div>
  )
}
