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
    >
      <div className="user-toast-content">
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
          className="user-toast-icon"
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
              <line x1="12" y1="16" x2="12.01" y2="16" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </>
          ) : (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          )}
        </svg>
        <span className="user-toast-text">{toast.message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="user-toast-dismiss"
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      )}
    </div>
  )
}
