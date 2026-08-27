import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'

function AdminGallery() {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    gal_title: '',
    gal_description: '',
    gal_date: '',
    gal_pic_path: '' // Simplified for design
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const data = await adminApi.getGallery()
    setGallery(data)
    setLoading(false)
  }

  const columns = [
    { key: 'gal_title', label: 'Event Title' },
    { key: 'gal_date', label: 'Event Date' },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormError('')
    setFormData({ gal_title: '', gal_description: '', gal_date: '', gal_pic_path: '' })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormError('')
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    await adminApi.deleteGallery(deleteTarget.id)
    setDeleteTarget(null)
    fetchData()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.gal_pic_path?.trim()) {
      setFormError('Photo path is required. Please provide an image for the gallery event.')
      return
    }

    if (editingItem) {
      await adminApi.updateGallery(editingItem.id, formData)
    } else {
      await adminApi.createGallery(formData)
    }
    setModalOpen(false)
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gallery Management</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl shadow-md transition-all font-semibold"
        >
          + Add New Event Gallery
        </button>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={gallery} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete item?"
        itemName={deleteTarget?.gal_title}
        confirmLabel="Delete"
      />

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingItem ? 'Edit Gallery Event' : 'Add New Gallery Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="admin-form-error-banner" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{formError}</span>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.gal_title}
              onChange={(e) => setFormData({...formData, gal_title: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              required
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.gal_date}
              onChange={(e) => setFormData({...formData, gal_date: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea 
              rows="3"
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.gal_description}
              onChange={(e) => setFormData({...formData, gal_description: e.target.value})}
            ></textarea>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Main Image Path <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="/images/gallery-example.png"
              className={`w-full p-3 rounded-xl border ${formError && !formData.gal_pic_path?.trim() ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-slate-700 dark:bg-slate-900'} focus:ring-2 focus:ring-primary outline-none transition-all`}
              value={formData.gal_pic_path}
              onChange={(e) => {
                setFormError('')
                setFormData({...formData, gal_pic_path: e.target.value})
              }}
            />
          </div>
          <p className="text-xs text-gray-500 italic">Tip: You can add more pictures once the gallery event is created.</p>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 text-gray-500 hover:text-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-xl shadow-lg transition-all font-semibold"
            >
              {editingItem ? 'Save Changes' : 'Create Gallery'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminGallery
