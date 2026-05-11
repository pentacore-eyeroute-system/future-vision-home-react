import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'

function AdminPartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    par_fullname: '',
    par_type: 'organization',
    par_contact: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const data = await adminApi.getPartners()
    setPartners(data)
    setLoading(false)
  }

  const columns = [
    { key: 'par_fullname', label: 'Name/Organization' },
    { 
      key: 'par_type', 
      label: 'Type',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{val}</span>
    },
    { key: 'par_contact', label: 'Contact' },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ par_fullname: '', par_type: 'organization', par_contact: '' })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      await adminApi.deletePartner(id)
      fetchData()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingItem) {
      await adminApi.updatePartner(editingItem.id, formData)
    } else {
      await adminApi.createPartner(formData)
    }
    setModalOpen(false)
    fetchData()
  }

  return (
    <div className="admin-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2>Our Partners</h2>
          <p>Manage individual and organization partners.</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          Add a Partner
        </button>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={partners} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingItem ? 'Edit Partner' : 'Add a Partner'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Name/Organization</label>
            <input 
              type="text" 
              required
              value={formData.par_fullname}
              onChange={(e) => setFormData({...formData, par_fullname: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Partner Type</label>
            <select 
              value={formData.par_type}
              onChange={(e) => setFormData({...formData, par_type: e.target.value})}
            >
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input 
              type="text" 
              value={formData.par_contact || ''}
              onChange={(e) => setFormData({...formData, par_contact: e.target.value})}
            />
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
