import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import { getAllGalleries, createGallery, updateGallery, temporaryDeleteGallery } from '../../api/galleryApi'
import { getAllNews, createNews, updateNews, temporaryDeleteNews } from '../../api/newsApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminImageUploadField from '../../components/admin/AdminImageUploadField'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminToast from '../../components/admin/AdminToast'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { filesToImageEntries, normalizeImageList } from '../../lib/adminImages'
import { extractErrorMessage } from '../../lib/errorUtils'
import './AdminNewsGallery.css'

function AdminNewsGallery() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [imageError, setImageError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'news',
    images: [],
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4500)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const newsResponse = await getAllNews()
      const newsData = newsResponse.data.result || []
      const activeNews = newsData.filter(item => !item.news_is_temporarily_deleted)

      const galleryResponse = await getAllGalleries().catch(async () => ({
        data: { result: await adminApi.getGallery() }
      }))

      const galleryData = galleryResponse.data.result || []
      const activeGalleryItems = galleryData.filter(item => !item.gal_is_temporarily_deleted)

      const combined = [
        ...activeNews.map((item) => ({
          ...item,
          id: item.news_id || item.id,
          type: 'news',
          displayTitle: item.news_title,
          displayDate: normalizeDate(item.news_date),
          images: normalizeImageList(item.newsPictures || item.news_images || item.news_pic_path),
        })),
        ...activeGalleryItems.map((item) => ({
          ...item,
          id: item.gal_id || item.id,
          type: 'gallery',
          displayTitle: item.gal_title,
          displayDate: normalizeDate(item.gal_date),
          images: normalizeImageList(item.galleryPictures || item.gal_images || item.gal_pic_path),
        })),
      ]

      setData(combined)
    } catch (error) {
      console.error("Failed fetching gallery/news items:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'displayTitle', label: 'Title' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span className="admin-news-gallery-type-tag">{val}</span>,
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

    const targetId = deleteTarget.id || deleteTarget.news_id || deleteTarget.gal_id

    if (deleteTarget.type === 'news') {
      try {
        await temporaryDeleteNews(targetId)
        showToast('News article deleted successfully.', 'success')
      } catch (error) {
        console.error("Error setting temporary delete status for news:", error)
        showToast(extractErrorMessage(error, 'Failed to delete news article.'), 'error')
      }
    } else {
      try {
        await temporaryDeleteGallery(targetId)
        showToast('Gallery item deleted successfully.', 'success')
      } catch (error) {
        console.error("Error setting temporary delete status for gallery:", error)
        showToast(extractErrorMessage(error, 'Failed to delete gallery item.'), 'error')
      }
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
    setImageError('')
    setDescriptionError('')

    if (formData.type === 'news' && !formData.description?.trim()) {
      setDescriptionError('Please add content/description for the news article.')
      return
    }

    if (formData.type === 'gallery' && !formData.description?.trim()) {
      setDescriptionError('Please add a description for the gallery event.')
      return
    }

    if (!formData.images || formData.images.length === 0) {
      setImageError(`Photo is required. Please upload at least one image for ${formData.type === 'news' ? 'the news article' : 'the gallery entry'}.`)
      return
    }

    setSubmitting(true)

    try {
      if (editingItem) {
        const targetId = editingItem.id || editingItem.news_id || editingItem.gal_id

        if (formData.type === 'news') {
          const data = new FormData()
          data.append('title', formData.title || '')
          data.append('news_title', formData.title || '')
          data.append('description', formData.description || '')
          data.append('news_description', formData.description || '')
          data.append('date', formData.date || '')
          data.append('news_date', formData.date || '')

          const existingNewsPicturesIds = formData.images
            .filter(image => !image.file && image.id !== undefined && image.id !== null)
            .map(image => image.id)
          data.append('existingNewsPicturesIds', JSON.stringify(existingNewsPicturesIds))

          const newFiles = formData.images.filter(img => img.file).map(img => img.file)
          if (newFiles.length > 0) {
            newFiles.forEach(file => {
              data.append('images', file)
            })
          } else if (formData.images.length > 0) {
            const existingImgUrl = formData.images[0].url || formData.images[0].path || ''
            data.append('existingImage', existingImgUrl)
          }

          await updateNews(targetId, data)
          showToast('News article updated successfully.', 'success')
        } else {
          const fd = new FormData()

          fd.append('title', formData.title || '')
          fd.append('gal_title', formData.title || '')

          fd.append('description', formData.description || '')
          fd.append('gal_description', formData.description || '')

          fd.append('date', formData.date || '')
          fd.append('gal_date', formData.date || '')

          const existingGalleryPicturesIds = formData.images
            .filter(image => !image.file && typeof image.id === 'number')
            .map(image => image.id)
          fd.append('existingGalleryPicturesIds', JSON.stringify(existingGalleryPicturesIds))

          const newFiles = formData.images.filter(image => image.file).map(image => image.file)

          if (newFiles.length > 0) {
            newFiles.forEach(file => {
              fd.append('images', file)
            })
          } else if (formData.images.length > 0) {
            const existingImgUrl = formData.images[0].url || formData.images[0].path || ''
            fd.append('existingImage', existingImgUrl)
          }

          await updateGallery(targetId, fd)
          showToast('Gallery event updated successfully.', 'success')
        }
      } else if (formData.type === 'news') {
        const data = new FormData()
        data.append('title', formData.title || '')
        data.append('news_title', formData.title || '')
        data.append('description', formData.description || '')
        data.append('news_description', formData.description || '')
        data.append('date', formData.date || '')
        data.append('news_date', formData.date || '')

        const newFiles = formData.images.filter(img => img.file).map(img => img.file)
        if (newFiles.length > 0) {
          newFiles.forEach(file => {
            data.append('images', file)
          })
        }

        await createNews(data)
        showToast('News article created successfully.', 'success')
      } else {
        const fd = new FormData()

        fd.append('title', formData.title || '')
        fd.append('gal_title', formData.title || '')

        fd.append('description', formData.description || '')
        fd.append('gal_description', formData.description || '')

        fd.append('date', formData.date || '')
        fd.append('gal_date', formData.date || '')

        const newFiles = formData.images.filter(image => image.file).map(image => image.file)
        if (newFiles.length > 0) {
          newFiles.forEach(file => {
            fd.append('images', file)
          })
        }

        await createGallery(fd)
        showToast('Gallery entry created successfully.', 'success')
      }

      setModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error submitting news/gallery form:", error)
      const errorMsg = extractErrorMessage(error, 'Failed to save entry.')
      showToast(errorMsg, 'error')
      setImageError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const normalizeDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-CA')
  };

  return (
    <div className="admin-section active">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-news-gallery-header">
        <div>
          <h2>News & Gallery</h2>
          <p>Create and manage news posts and gallery items.</p>
        </div>
        <button type="button" className="btn-add" onClick={handleOpenAdd} aria-label="Create Post">
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
        subtitle={
          editingItem
            ? `Update details for this ${formData.type} entry.`
            : `Fill in the information below to publish a new ${formData.type === 'news' ? 'news' : 'gallery'} entry.`
        }
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="admin-form">
          {formData.type === 'gallery' ? (
            <div className="news-gallery-modal-grid">
              {/* Left Column: Image Uploader */}
              <div className="news-gallery-photo-col">
                <AdminImageUploadField
                  inputId="newsGalleryImages"
                  label="Gallery Photos"
                  images={formData.images}
                  multiple
                  required={true}
                  onFilesSelected={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                  helperText="Upload at least one photo for this gallery."
                />
              </div>

              {/* Right Column: Metadata Fields */}
              <div className="news-gallery-fields-col flex flex-col gap-3.5">
                <div className="form-group mb-0">
                  <label htmlFor="galleryTitle">Title <span className="text-red-500">*</span></label>
                  <input
                    id="galleryTitle"
                    type="text"
                    required
                    placeholder="Enter gallery title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group mb-0">
                    <label htmlFor="galleryType">Type</label>
                    <select
                      id="galleryType"
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

                  <div className="form-group mb-0">
                    <label htmlFor="galleryDate">Date <span className="text-red-500">*</span></label>
                    <input
                      id="galleryDate"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group mb-0 flex-1 flex flex-col">
                  <label htmlFor="galleryDescription">Description <span className="text-red-500">*</span></label>
                  <textarea
                    id="galleryDescription"
                    required
                    rows={4}
                    placeholder="Enter a brief description for this gallery..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 min-h-[110px]"
                  ></textarea>
                </div>
              </div>
            </div>
          ) : (
            <div className="news-modal-wrapper">
              <div className="news-meta-grid">
                {/* Left Column: Featured Cover Image */}
                <div className="news-featured-col">
                  <AdminImageUploadField
                    inputId="newsFeaturedImage"
                    label="Cover Photo / Images"
                    images={formData.images}
                    multiple
                    required={true}
                    onFilesSelected={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                    helperText="Upload a featured cover image."
                  />
                </div>

                {/* Right Column: Title, Type, Date */}
                <div className="news-meta-fields">
                  <div className="form-group mb-0">
                    <label htmlFor="newsArticleTitle">Article Title <span className="text-red-500">*</span></label>
                    <input
                      id="newsArticleTitle"
                      type="text"
                      required
                      placeholder="Enter news article title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group mb-0">
                      <label htmlFor="newsType">Type</label>
                      <select
                        id="newsType"
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

                    <div className="form-group mb-0">
                      <label htmlFor="newsPublishDate">Publish Date <span className="text-red-500">*</span></label>
                      <input
                        id="newsPublishDate"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Full Width Rich Text Content */}
              <div className="form-group mt-3.5 mb-0">
                <label>Article Content <span className="text-red-500">*</span></label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(description) => {
                    setFormData({ ...formData, description })
                    setDescriptionError('')
                  }}
                />
              </div>
            </div>
          )}

          {(imageError || descriptionError) && (
            <div className="admin-form-error-banner mb-0" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{imageError || descriptionError}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" disabled={submitting} onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="btn-spinner"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>{editingItem ? 'Updating...' : 'Publishing...'}</span>
                </>
              ) : (
                <span>{editingItem ? 'Update Post' : 'Publish Post'}</span>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminNewsGallery
