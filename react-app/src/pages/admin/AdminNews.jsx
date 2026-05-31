import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'

function AdminNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    news_title: '',
    news_description: '',
    news_date: '',
    news_pic_path: '' // Simplified for design
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const data = await adminApi.getNews()
    setNews(data)
    setLoading(false)
  }

  const columns = [
    { key: 'news_title', label: 'Title' },
    { key: 'news_date', label: 'Date' },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ news_title: '', news_description: '', news_date: '', news_pic_path: '' })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      await adminApi.deleteNews(id)
      fetchData()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingItem) {
      await adminApi.updateNews(editingItem.id, formData)
    } else {
      await adminApi.createNews(formData)
    }
    setModalOpen(false)
    fetchData()
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
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Thumbnail Path</label>
            <input 
              type="text" 
              placeholder="/images/news-example.png"
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.news_pic_path}
              onChange={(e) => setFormData({...formData, news_pic_path: e.target.value})}
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
