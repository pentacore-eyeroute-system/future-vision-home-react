import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import { galleryApi } from '../../api/galleryApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminImageUploadField from '../../components/admin/AdminImageUploadField'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { filesToImageEntries, normalizeImageList } from '../../lib/adminImages'

function AdminNewsGallery() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [imageError, setImageError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'news',
    images: [],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const news = await adminApi.getNews()
    const gallery = await galleryApi.getGalleries().catch(async () => ({
      result: await adminApi.getGallery(),
    }))

    const combined = [
      ...news.map((item) => ({
        ...item,
        type: 'news',
        displayTitle: item.news_title,
        displayDate: item.news_date,
        images: normalizeImageList(item.news_images || item.news_pic_path),
      })),
      ...gallery.result.map((item) => ({
        ...item,
        type: 'gallery',
        displayTitle: item.gal_title,
        displayDate: normalizeDate(item.gal_date),
        images: normalizeImageList(item.galleryPictures || item.gal_images || item.gal_pic_path),
      })),
    ]

    setData(combined)
    setLoading(false)
  }

  const columns = [
    { key: 'displayTitle', label: 'Title' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{val}</span>,
    },
    { key: 'displayDate', label: 'Date' },
    {
      key: 'imageCount',
      label: 'Photos',
      render: (_, item) => `${normalizeImageList(item.images).length} uploaded`,
    },
  ]

  const handleOpenAdd = () => {
    setEditingItem(null)
    setImageError('')
    setDescriptionError('')
    setFormData({ title: '', description: '', date: '', type: 'news', images: [] })
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setImageError('')
    setDescriptionError('')
    setFormData({
      title: item.displayTitle,
      description: item.news_description || item.gal_description || '',
      date: item.displayDate || '',
      type: item.type,
      images: normalizeImageList(item.images || item.news_images || item.gal_images || item.news_pic_path || item.gal_pic_path),
    })
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'news') {
      await adminApi.deleteNews(deleteTarget.id)
    } else {
      let isTemporarilyDeleted = !deleteTarget.is_temporarily_deleted;

      await galleryApi.temporaryDeleteGallery(deleteTarget.id, { isTemporarilyDeleted: isTemporarilyDeleted});
    }
    setDeleteTarget(null)
    fetchData()
  }

  const handleImageUpload = async (event) => {
    const nextImages = await filesToImageEntries(event.target.files)

    setFormData((current) => ({
      ...current,
      images: [...current.images, ...nextImages],
    }))
    setImageError('')

    event.target.value = ''
  }

  const handleRemoveImage = (imageId) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((image) => image.id !== imageId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.type === 'news' && !formData.description.trim()) {
      setDescriptionError('Please add a description for news posts.')
      return
    }

    if (formData.type === 'gallery' && formData.images.length === 0) {
      setImageError('Please upload at least one photo for gallery posts.')
      return
    }

    if (editingItem) {
      if (formData.type === 'news') {
        await adminApi.updateNews(editingItem.id, {
          news_title: formData.title,
          news_description: formData.description,
          news_date: formData.date,
          news_images: formData.images,
        })
      } else {
        const existingGalleryPicturesIds = formData.images.map(image => image.id);

        const fd = new FormData();

        fd.append('title', formData.title);
        fd.append('description', formData.description);
        fd.append('date', formData.date);
        fd.append('existingGalleryPicturesIds', JSON.stringify(existingGalleryPicturesIds));

        formData.images.forEach(image => {
          fd.append('images', image.file);
        });
        
        await galleryApi.updateGallery(editingItem.id, fd);
      }
    } else if (formData.type === 'news') {
      await adminApi.createNews({
        news_title: formData.title,
        news_description: formData.description,
        news_date: formData.date,
        news_images: formData.images,
      })
    } else {
      const fd = new FormData();

      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('date', formData.date);

      formData.images.forEach(image => {
        fd.append('images', image.file);
      });

      await galleryApi.createGallery(fd);
    }

    setModalOpen(false)
    fetchData()
  }

  const normalizeDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA');
  };

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
        isLoading={loading}
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete item?"
        itemName={deleteTarget?.displayTitle}
        confirmLabel="Delete"
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={formData.type}
              disabled={!!editingItem}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value })
                setImageError('')
                setDescriptionError('')
              }}
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
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            {formData.type === 'news' ? (
              <>
                <RichTextEditor
                  value={formData.description}
                  onChange={(description) => {
                    setFormData({ ...formData, description })
                    setDescriptionError('')
                  }}
                />
                {descriptionError && <p className="admin-upload-error">{descriptionError}</p>}
              </>
            ) : (
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            )}
          </div>
          <AdminImageUploadField
            inputId="newsGalleryImages"
            label="Pictures"
            images={formData.images}
            multiple
            required={formData.type === 'gallery' && formData.images.length === 0}
            onFilesSelected={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            errorText={imageError}
            helperText={formData.type === 'gallery' ? 'Upload at least one image for gallery entries.' : 'Upload multiple images for news posts or gallery entries.'}
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

export default AdminNewsGallery
