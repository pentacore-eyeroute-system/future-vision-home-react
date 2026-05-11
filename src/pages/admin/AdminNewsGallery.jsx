import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'

function AdminNewsGallery() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'news',
    pic_path: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const news = await adminApi.getNews()
    const gallery = await adminApi.getGallery()
    
    // Combine and mark types
    const combined = [
      ...news.map(n => ({ ...n, type: 'news', displayTitle: n.news_title, displayDate: n.news_date })),
      ...gallery.map(g => ({ ...g, type: 'gallery', displayTitle: g.gal_title, displayDate: g.gal_date }))
    ]
    
    setData(combined)
    setLoading(false)
  }

  const columns = [
    { key: 'displayTitle', label: 'Title' },
    { 
      key: 'type', 
      label: 'Type',
      render: (val) => (
        <span style={{ textTransform: 'capitalize' }}>{val}</span>
      )
    },
    { key: 'displayDate', label: 'Date' },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ title: '', description: '', date: '', type: 'news', pic_path: '' })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.displayTitle,
      description: item.news_description || item.gal_description || '',
      date: item.displayDate || '',
      type: item.type,
      pic_path: item.news_pic_path || item.gal_pic_path || ''
    })
    setModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (item.type === 'news') {
        await adminApi.deleteNews(item.id)
      } else {
        await adminApi.deleteGallery(item.id)
      }
      fetchData()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      pic_path: formData.pic_path
    }

    if (editingItem) {
      if (formData.type === 'news') {
        await adminApi.updateNews(editingItem.id, payload)
      } else {
        await adminApi.updateGallery(editingItem.id, payload)
      }
    } else {
      if (formData.type === 'news') {
        await adminApi.createNews(payload)
      } else {
        await adminApi.createGallery(payload)
      }
    }
    setModalOpen(false)
    fetchData()
  }

  return (
    <div className="admin-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2>News & Gallery</h2>
          <p>Create and manage news posts and gallery items.</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          Create Post
        </button>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={data} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingItem ? 'Edit Post' : 'Create Post'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select 
              value={formData.type}
              disabled={!!editingItem}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="news">News</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Image Path</label>
            <input 
              type="text" 
              placeholder="/images/example.png"
              value={formData.pic_path}
              onChange={(e) => setFormData({...formData, pic_path: e.target.value})}
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

export default AdminNewsGallery
