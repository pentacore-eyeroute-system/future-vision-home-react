import { useState, useEffect } from 'react'
import { getAllPartners, addPartner, updatePartner, temporaryDeletePartner } from '../../api/partnerApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import './AdminPartners.css'

function AdminPartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    par_fullname: '',
    par_type: 'organization',
  })

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
      setDeleteTarget(null)
      fetchData() // Refresh view rows to omit the deleted item
    } catch (error) {
      console.error("Error setting temporary delete status:", error)
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
      fetchData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error creating partner:", error)
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
      fetchData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error updating partner:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingItem) {
      await handleUpdatePartner(editingItem.id, formData)
    } else {
      await handleAddPartner(formData)
    }
  }

  return (
    <div className="admin-section active">
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
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminPartners

