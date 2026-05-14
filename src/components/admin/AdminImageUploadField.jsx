function AdminImageUploadField({
  inputId,
  label,
  images,
  onFilesSelected,
  onRemoveImage,
  helperText,
  multiple = true,
}) {
  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type="file" accept="image/*" multiple={multiple} onChange={onFilesSelected} />
      <p className="admin-upload-helper">
        {helperText || 'Upload one or more images instead of typing a file path.'}
      </p>

      {images.length > 0 && (
        <div className="admin-upload-preview-grid">
          {images.map((image) => (
            <div key={image.id} className="admin-upload-preview-card">
              <img src={image.url} alt={image.name} className="admin-upload-preview-image" />
              <div className="admin-upload-preview-meta">
                <span className="admin-upload-preview-name">{image.name}</span>
                <button type="button" className="admin-upload-remove" onClick={() => onRemoveImage(image.id)}>
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
