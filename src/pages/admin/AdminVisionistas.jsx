import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminImageUploadField from '../../components/admin/AdminImageUploadField'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import { filesToImageEntries, normalizeImageList } from '../../lib/adminImages'

function AdminVisionistas() {
  const [visionistas, setVisionistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    vis_fullname: '',
    vis_age: '',
    vis_story: '',
    vis_images: [],
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
      key: 'vis_images',
      label: 'Photos',
      render: (val) => `${normalizeImageList(val).length} uploaded`,
    },
    { 
      key: 'vis_story', 
      label: 'Story',
      render: (val) => val?.length > 100 ? val.substring(0, 100) + '...' : val
    },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ vis_fullname: '', vis_age: '', vis_story: '', vis_images: [], vis_is_archived: false })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      ...item,
      vis_images: normalizeImageList(item.vis_images || item.vis_pic_path),
    })
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    await adminApi.deleteVisionista(deleteTarget.id)
    setDeleteTarget(null)
    fetchData()
  }

  const handleImageUpload = async (event) => {
    const nextImages = await filesToImageEntries(event.target.files)

    setFormData((current) => ({
      ...current,
      vis_images: [...current.vis_images, ...nextImages],
    }))

    event.target.value = ''
  }

  const handleRemoveImage = (imageId) => {
    setFormData((current) => ({
      ...current,
      vis_images: current.vis_images.filter((image) => image.id !== imageId),
    }))
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
        isLoading={loading}
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete item?"
        itemName={deleteTarget?.vis_fullname}
        confirmLabel="Delete"
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
          <AdminImageUploadField
            inputId="visionistaImages"
            label="Pictures"
            images={formData.vis_images}
            multiple
            onFilesSelected={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            helperText="Upload one or more photos for this visionista profile."
          />
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
