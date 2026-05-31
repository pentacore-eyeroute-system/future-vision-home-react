function AdminImageUploadField({
  inputId,
  label,
  images,
  onFilesSelected,
  onRemoveImage,
  helperText,
  errorText,
  multiple = true,
  required = false,
}) {
  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type="file" accept="image/*" multiple={multiple} required={required} onChange={onFilesSelected} />
      <p className="admin-upload-helper">
        {helperText || 'Upload one or more images instead of typing a file path.'}
      </p>
      {errorText && <p className="admin-upload-error">{errorText}</p>}

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
