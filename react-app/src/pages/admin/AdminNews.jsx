import { useState, useEffect } from 'react'
import { getAllNews, createNews, updateNews, temporaryDeleteNews } from '../../api/newsApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminImageUploadField from '../../components/admin/AdminImageUploadField'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import { filesToImageEntries, normalizeImageList } from '../../lib/adminImages'

function AdminNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    news_title: '',
    news_description: '',
    news_date: '',
    news_images: []
  })

  useEffect(() => {
    fetchNewsData()
  }, [])

  const fetchNewsData = async () => {
    setLoading(true)
    try {
      const response = await getAllNews()
      const data = response.data.result || []
      // Filter out items marked as temporarily deleted by the backend
      const activeItems = data.filter(item => !item.news_is_temporarily_deleted)
      setNews(activeItems)
    } catch (error) {
      console.error("Failed fetching news articles:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'news_title', label: 'Title' },
    { key: 'news_date', label: 'Date' },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ news_title: '', news_description: '', news_date: '', news_images: [] })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      news_title: item.news_title || '',
      news_description: item.news_description || '',
      news_date: item.news_date ? new Date(item.news_date).toLocaleDateString('en-CA') : '',
      news_images: normalizeImageList(item.newsPictures || item.news_images || item.news_pic_path),
    })
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await confirmDeleteNews(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleImageUpload = async (event) => {
    const nextImages = await filesToImageEntries(event.target.files)
    setFormData((current) => ({
      ...current,
      news_images: [...current.news_images, ...nextImages],
    }))
    event.target.value = ''
  }

  const handleRemoveImage = (imageId) => {
    setFormData((current) => ({
      ...current,
      news_images: current.news_images.filter((image) => image.id !== imageId),
    }))
  }

  const handleCreateNews = async (formValues, imageFile) => {
    const data = new FormData()
    
    // Append both common naming formats to prevent backend schema matching failures
    data.append('title', formValues.news_title || '')
    data.append('news_title', formValues.news_title || '')
    
    data.append('description', formValues.news_description || '')
    data.append('news_description', formValues.news_description || '')
    
    data.append('date', formValues.news_date || '')
    data.append('news_date', formValues.news_date || '')

    const newFiles = formValues.news_images.filter(img => img.file).map(img => img.file)
    if (newFiles.length > 0) {
      newFiles.forEach(file => {
        data.append('images', file)
      })
    }

    try {
      await createNews(data)
      fetchNewsData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error creating news article:", error)
    }
  }

  const handleUpdateNews = async (id, formValues, imageFile) => {
    const data = new FormData()
    
    data.append('title', formValues.news_title || '')
    data.append('news_title', formValues.news_title || '')
    
    data.append('description', formValues.news_description || '')
    data.append('news_description', formValues.news_description || '')
    
    data.append('date', formValues.news_date || '')
    data.append('news_date', formValues.news_date || '')

    const existingNewsPicturesIds = formValues.news_images
      .filter(image => !image.file && image.id !== undefined && image.id !== null)
      .map(image => image.id)
    data.append('existingNewsPicturesIds', JSON.stringify(existingNewsPicturesIds))

    const newFiles = formValues.news_images.filter(img => img.file).map(img => img.file)
    if (newFiles.length > 0) {
      newFiles.forEach(file => {
        data.append('images', file)
      })
    } else if (formValues.news_images && formValues.news_images.length > 0) {
      // No new image selected: send back the existing string resource tracker path safely
      const existingImgUrl = formValues.news_images[0].url || formValues.news_images[0].path || ''
      data.append('existingImage', existingImgUrl)
    }

    try {
      await updateNews(id, data)
      fetchNewsData()
      setModalOpen(false)
    } catch (error) {
      console.error("Error updating news article:", error)
    }
  }

  const confirmDeleteNews = async (id) => {
    try {
      await temporaryDeleteNews(id)
      fetchNewsData() // Refresh view grid
    } catch (error) {
      console.error("Error setting temporary delete status for news:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newFiles = formData.news_images.filter(img => img.file).map(img => img.file)
    const imageFile = newFiles[0] || null

    if (editingItem) {
      await handleUpdateNews(editingItem.id, formData, imageFile)
    } else {
      await handleCreateNews(formData, imageFile)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">News Management</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl shadow-md transition-all font-semibold"
        >
          + Post New Article
        </button>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={news} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        isLoading={loading}
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete item?"
        itemName={deleteTarget?.news_title}
        confirmLabel="Delete"
      />

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingItem ? 'Edit News Article' : 'Post New News Article'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Title</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.news_title}
              onChange={(e) => setFormData({...formData, news_title: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
            <input 
              type="date" 
              required
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.news_date}
              onChange={(e) => setFormData({...formData, news_date: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description / Content</label>
            <textarea 
              rows="6"
              required
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.news_description}
              onChange={(e) => setFormData({...formData, news_description: e.target.value})}
            ></textarea>
          </div>
          <div className="space-y-1">
            <AdminImageUploadField
              inputId="newsImages"
              label="Pictures"
              images={formData.news_images}
              multiple={true}
              onFilesSelected={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              helperText="Upload one or more photos for this news article."
            />
          </div>
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
              {editingItem ? 'Save Changes' : 'Post Article'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminNews
