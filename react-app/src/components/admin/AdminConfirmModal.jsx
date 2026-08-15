import AdminModal from './AdminModal'

function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  action = 'delete',
  confirmLabel = 'Delete',
  children,
}) {
  const confirmClass = action === 'restore' ? 'restore-confirm-btn' : 'delete-confirm-btn'

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={`delete-confirmation ${action === 'restore' ? 'restore-confirmation' : ''}`}>
        <div className="delete-confirmation-body">
          {children || (
            <p>
              This will move <strong>{itemName}</strong> to Recently Deleted. You can restore it later.
            </p>
          )}
        </div>
        <div className="delete-confirmation-footer">
          <button type="button" className="delete-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={confirmClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}

export default AdminConfirmModal
