function AdminModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="modal active" onClick={(e) => e.target.classList.contains('modal') && onClose()}>
      <div className="modal-content animate-fadeInUp">
        <div className="modal-header">
          <h2>{title}</h2>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminModal
