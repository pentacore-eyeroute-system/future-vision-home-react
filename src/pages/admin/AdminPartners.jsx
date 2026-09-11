import { useState, useEffect } from 'react'
import { getAllPartners, addPartner, updatePartner, temporaryDeletePartner } from '../../api/partnerApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminToast from '../../components/admin/AdminToast'
import { extractErrorMessage } from '../../lib/errorUtils'
import './AdminPartners.css'

function AdminPartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    par_fullname: '',
    par_type: 'organization',
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4500)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getAllPartners()
      const data = response.data.result || []
      // Filter out items where the temporary deletion flag is active
      const activeItems = data.filter(item => !item.par_is_temporarily_deleted)
      setPartners(activeItems)
    } catch (error) {
      console.error("Failed fetching partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'par_fullname', label: 'Name/Organization' },
    { 
      key: 'par_type', 
      label: 'Type',
      render: (val) => <span className="admin-partners-type-tag">{val}</span>
    },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ par_fullname: '', par_type: 'organization' })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await temporaryDeletePartner(deleteTarget.id)
      showToast('Partner deleted successfully.', 'success')
      setDeleteTarget(null)
      fetchData() // Refresh view rows to omit the deleted item
    } catch (error) {
      console.error("Error setting temporary delete status:", error)
      showToast(extractErrorMessage(error, 'Failed to delete Partner.'), 'error')
    }
  }

  const handleAddPartner = async (formValues) => {
    const payload = {
      fullname: formValues.par_fullname || '',
      par_fullname: formValues.par_fullname || '',
      type: formValues.par_type || 'organization',
      par_type: formValues.par_type || 'organization'
    }

    try {
      await addPartner(payload)
      showToast('Partner added successfully.', 'success')
      fetchData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error creating partner:", error)
      showToast(extractErrorMessage(error, 'Failed to create partner.'), 'error')
    }
  }

  const handleUpdatePartner = async (id, formValues) => {
    const payload = {
      fullname: formValues.par_fullname || '',
      par_fullname: formValues.par_fullname || '',
      type: formValues.par_type || 'organization',
      par_type: formValues.par_type || 'organization'
    }

    try {
      await updatePartner(id, payload)
      showToast('Partner updated successfully.', 'success')
      fetchData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error updating partner:", error)
      showToast(extractErrorMessage(error, 'Failed to update partner.'), 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingItem) {
        await handleUpdatePartner(editingItem.id, formData)
      } else {
        await handleAddPartner(formData)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-section active">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-partners-header">
        <div>
          <h2>Our Partners</h2>
          <p>Manage individual and organization partners.</p>
        </div>
        <button type="button" className="btn-add" onClick={handleOpenAdd} aria-label="Add a Partner">
          Add a Partner
        </button>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={partners} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        isLoading={loading}
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete item?"
        itemName={deleteTarget?.par_fullname}
        confirmLabel="Delete"
      />

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingItem ? 'Edit Partner' : 'Add a Partner'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="partnerFullName">Name/Organization</label>
            <input 
              id="partnerFullName"
              type="text" 
              required
              value={formData.par_fullname}
              onChange={(e) => setFormData({...formData, par_fullname: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="partnerType">Partner Type</label>
            <select 
              id="partnerType"
              value={formData.par_type}
              onChange={(e) => setFormData({...formData, par_type: e.target.value})}
            >
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
              <option value="parent">Parent/Guardian</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" disabled={submitting} onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block', marginRight: '6px' }}
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>{editingItem ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminPartners

