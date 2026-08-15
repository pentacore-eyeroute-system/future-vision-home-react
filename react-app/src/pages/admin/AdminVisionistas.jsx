import { useState, useEffect, useRef } from 'react'
import { getAllVisionistas, addVisionista, updateVisionista, temporaryDeleteVisionista } from '../../api/visionistaApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminModal from '../../components/admin/AdminModal'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import { filesToImageEntries, normalizeImageList } from '../../lib/adminImages'

function AdminVisionistas() {
  const [visionistas, setVisionistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    vis_fullname: '',
    vis_age: '',
    vis_story: '',
    vis_images: [],
    vis_is_archived: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getAllVisionistas()
      const data = response.data?.result || []
      const activeItems = data.filter((item) => !item.vis_is_temporarily_deleted)
      setVisionistas(activeItems)
    } catch (error) {
      console.error('Failed fetching visionistas:', error)
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
      render: (val) => (val?.length > 100 ? val.substring(0, 100) + '...' : val),
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
      vis_is_archived: false,
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
      console.error('Error setting temporary delete status:', error)
    }
  }

  const handleImageUpload = async (event) => {
    const nextImages = await filesToImageEntries(event.target.files)

    setFormData((current) => ({
      ...current,
      vis_images: nextImages.slice(0, 1),
    }))

    event.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const nextImages = await filesToImageEntries(e.dataTransfer.files)
      setFormData((current) => ({
        ...current,
        vis_images: nextImages.slice(0, 1),
      }))
    }
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
      console.error('Error creating visionista:', error)
      if (error.response) {
        console.error('Backend error details:', error.response.data)
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
      console.error('Error updating visionista:', error)
      if (error.response) {
        console.error('Backend error details:', error.response.data)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const imageFile = formData.vis_images.find((img) => img.file)?.file || null

    try {
      if (editingItem) {
        await handleUpdateVisionista(editingItem.id, formData, imageFile)
      } else {
        await handleAddVisionista(formData, imageFile)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const currentPhoto = formData.vis_images && formData.vis_images.length > 0 ? formData.vis_images[0] : null

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
        subtitle={
          editingItem
            ? 'Update the profile details and photo for this member.'
            : 'Fill in the details below to create a new visionista profile.'
        }
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="visionista-form">
          <div className="visionista-modal-grid">
            {/* Left Column: Dedicated Photo Upload Dropzone */}
            <div className="visionista-photo-col">
              <label className="visionista-field-label">
                Profile Photo
              </label>

              <div
                className={`visionista-dropzone ${isDragging ? 'is-dragging' : ''} ${currentPhoto ? 'has-image' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  id="vis_photo_input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                {currentPhoto ? (
                  <div className="visionista-preview-wrapper group">
                    <img
                      src={currentPhoto.url}
                      alt={formData.vis_fullname || 'Visionista preview'}
                      className="visionista-preview-img"
                    />
                    <div className="visionista-preview-overlay">
                      <button
                        type="button"
                        className="btn-change-photo"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Change Photo
                      </button>
                      <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage(currentPhoto.id)
                        }}
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="visionista-dropzone-prompt">
                    <div className="dropzone-icon-circle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <p className="dropzone-primary-text">
                      <span className="font-semibold text-[#95ab2f] underline underline-offset-2">Click to upload</span> or drag and drop
                    </p>
                    <p className="dropzone-subtext">JPG, PNG or WEBP (Max 5MB)</p>
                    <span className="dropzone-badge">Recommended ratio 3:4</span>
                  </div>
                )}
              </div>

              <p className="visionista-helper-text">
                Max size 5MB (JPG/PNG). Recommended ratio 3:4.
              </p>
            </div>

            {/* Right Column: Form Fields */}
            <div className="visionista-fields-col">
              {/* Row 1: Full Name & Age */}
              <div className="visionista-name-age-row">
                <div className="visionista-name-field">
                  <label htmlFor="vis_fullname" className="visionista-field-label">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="vis_fullname"
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    className="visionista-input"
                    value={formData.vis_fullname}
                    onChange={(e) => setFormData({ ...formData, vis_fullname: e.target.value })}
                  />
                </div>
                <div className="visionista-age-field">
                  <label htmlFor="vis_age" className="visionista-field-label">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="vis_age"
                    type="number"
                    min="1"
                    max="120"
                    required
                    placeholder="e.g. 21"
                    className="visionista-input"
                    value={formData.vis_age}
                    onChange={(e) => setFormData({ ...formData, vis_age: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Story / Bio */}
              <div className="visionista-story-field">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="vis_story" className="visionista-field-label mb-0">
                    Story / Bio <span className="text-red-500">*</span>
                  </label>
                  <span className="visionista-char-counter">
                    {formData.vis_story?.length || 0} / 500
                  </span>
                </div>
                <textarea
                  id="vis_story"
                  rows={5}
                  required
                  placeholder="Tell us about their journey, achievements, and aspirations..."
                  className="visionista-textarea"
                  value={formData.vis_story}
                  onChange={(e) => setFormData({ ...formData, vis_story: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Sticky Pinned Form Actions */}
          <div className="visionista-form-actions">
            <button
              type="button"
              className="visionista-btn-cancel"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="visionista-btn-submit"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>{editingItem ? 'Save Changes' : 'Save Visionista'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminVisionistas

