import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'

function AdminVisionistas() {
  const [visionistas, setVisionistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    vis_fullname: '',
    vis_age: '',
    vis_story: '',
    vis_pic_path: '',
    vis_is_archived: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const data = await adminApi.getVisionistas()
    setVisionistas(data)
    setLoading(false)
  }

  const columns = [
    { key: 'vis_fullname', label: 'Name' },
    { key: 'vis_age', label: 'Age' },
    { 
      key: 'vis_story', 
      label: 'Story',
      render: (val) => val?.length > 100 ? val.substring(0, 100) + '...' : val
    },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ vis_fullname: '', vis_age: '', vis_story: '', vis_pic_path: '', vis_is_archived: false })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this visionista?')) {
      await adminApi.deleteVisionista(id)
      fetchData()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingItem) {
      await adminApi.updateVisionista(editingItem.id, formData)
    } else {
      await adminApi.createVisionista(formData)
    }
    setModalOpen(false)
    fetchData()
  }

  return (
    <div className="admin-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2>Visionistas</h2>
          <p>Manage and organize visionista profiles.</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          Add Visionista Profile
        </button>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={visionistas} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingItem ? 'Edit Visionista Profile' : 'Add Visionista Profile'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              required
              value={formData.vis_fullname}
              onChange={(e) => setFormData({...formData, vis_fullname: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input 
              type="number" 
              required
              value={formData.vis_age}
              onChange={(e) => setFormData({...formData, vis_age: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Story</label>
            <textarea 
              required
              value={formData.vis_story}
              onChange={(e) => setFormData({...formData, vis_story: e.target.value})}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Picture Path</label>
            <input 
              type="text" 
              placeholder="/images/example.png"
              value={formData.vis_pic_path}
              onChange={(e) => setFormData({...formData, vis_pic_path: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              value={formData.vis_is_archived ? 'archived' : 'active'}
              onChange={(e) => setFormData({...formData, vis_is_archived: e.target.value === 'archived'})}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
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

export default AdminVisionistas
