import { useState, useRef } from 'react'

function AdminImageUploadField({
  inputId = 'adminImageUpload',
  label = 'Images',
  images = [],
  onFilesSelected,
  onRemoveImage,
  helperText,
  errorText,
  multiple = true,
  required = false,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected({
        target: {
          files: e.dataTransfer.files,
          value: '',
        },
      })
    }
  }

  return (
    <div className="admin-upload-field-group">
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={inputId} className="visionista-field-label mb-0">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {images.length > 0 && (
          <span className="text-xs font-medium text-slate-500">
            {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
          </span>
        )}
      </div>

      <div
        className={`admin-dropzone-box ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple={multiple}
          required={required && images.length === 0}
          onChange={onFilesSelected}
          style={{ display: 'none' }}
        />

        <div className="admin-dropzone-content">
          <div className="dropzone-icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p className="dropzone-primary-text">
            <span className="text-primary font-semibold underline underline-offset-2">Click to upload</span> or drag and drop
          </p>
          <p className="dropzone-subtext">
            {helperText || (multiple ? 'JPG, PNG or WEBP (Max 5MB)' : 'JPG, PNG or WEBP (Max 5MB)')}
          </p>
        </div>
      </div>

      {errorText && <p className="admin-upload-error">{errorText}</p>}

      {images.length > 0 && (
        <div className="admin-upload-preview-grid">
          {images.map((image) => (
            <div key={image.id} className="admin-upload-preview-card">
              <img src={image.url} alt={image.name} className="admin-upload-preview-image" />
              <div className="admin-upload-preview-meta">
                <span className="admin-upload-preview-name" title={image.name}>{image.name}</span>
                <button
                  type="button"
                  className="admin-upload-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveImage(image.id)
                  }}
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminImageUploadField
