import { useState, useEffect } from 'react'
import { getAllVisionistas, addVisionista, updateVisionista, temporaryDeleteVisionista } from '../../api/visionistaApi'
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
    try {
      const response = await getAllVisionistas()
      const data = response.data.result || []
      const activeItems = data.filter(item => !item.vis_is_temporarily_deleted)
      setVisionistas(activeItems)
    } catch (error) {
      console.error("Failed fetching visionistas:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'vis_fullname', label: 'Name' },
    { key: 'vis_age', label: 'Age' },
    {
      key: 'vis_images',
      label: 'Photos',
      render: (val, item) => {
        const list = normalizeImageList(val || item.vis_pic_url || item.vis_pic_path)
        return `${list.length} uploaded`
      },
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
      vis_fullname: item.vis_fullname || '',
      vis_age: item.vis_age || '',
      vis_story: item.vis_story || '',
      vis_images: normalizeImageList(item.vis_pic_url || item.vis_pic_path),
      vis_is_archived: false
    })
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await temporaryDeleteVisionista(deleteTarget.id)
      setDeleteTarget(null)
      fetchData()
    } catch (error) {
      console.error("Error setting temporary delete status:", error)
    }
  }

  const handleImageUpload = async (event) => {
    const nextImages = await filesToImageEntries(event.target.files)

    setFormData((current) => ({
      ...current,
      // Replace current selection since it's a single image upload
      vis_images: nextImages.slice(0, 1),
    }))

    event.target.value = ''
  }

  const handleRemoveImage = (imageId) => {
    setFormData((current) => ({
      ...current,
      vis_images: current.vis_images.filter((image) => image.id !== imageId),
    }))
  }

  const handleAddVisionista = async (formValues, imageFile) => {
    const data = new FormData()
    data.append('fullname', formValues.vis_fullname)
    data.append('age', formValues.vis_age)
    data.append('story', formValues.vis_story)
    if (imageFile) {
      data.append('image', imageFile)
    }

    try {
      await addVisionista(data)
      fetchData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error creating visionista:", error)
      if (error.response) {
        console.error("Backend error details:", error.response.data)
      }
    }
  }

  const handleUpdateVisionista = async (id, formValues, imageFile) => {
    const data = new FormData()
    
    // Non-prefixed keys
    data.append('fullname', formValues.vis_fullname || '')
    data.append('age', formValues.vis_age || '')
    data.append('story', formValues.vis_story || '')

    // Prefixed keys (to account for different backend expectations)
    data.append('vis_fullname', formValues.vis_fullname || '')
    data.append('vis_age', formValues.vis_age || '')
    data.append('vis_story', formValues.vis_story || '')

    // Handle image file - ONLY append if a new one is selected
    if (imageFile) {
      data.append('image', imageFile)
    }

    try {
      await updateVisionista(id, data)
      await fetchData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error updating visionista:", error)
      if (error.response) {
        console.error("Backend error details:", error.response.data)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const imageFile = formData.vis_images.find(img => img.file)?.file || null

    if (editingItem) {
      await handleUpdateVisionista(editingItem.id, formData, imageFile)
    } else {
      await handleAddVisionista(formData, imageFile)
    }
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
            multiple={false}
            onFilesSelected={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            helperText="Upload a photo for this visionista profile."
          />
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

