const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`))
    reader.readAsDataURL(file)
  })

export const filesToImageEntries = async (fileList) => {
  const files = Array.from(fileList || [])

  return Promise.all(
    files.map(async (file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      url: await readFileAsDataUrl(file),
    }))
  )
}

export const normalizeImageList = (value) => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `legacy-${index}`,
            name: `Image ${index + 1}`,
            url: item,
          }
        }

        return {
          id: item.id || `image-${Date.now()}-${index}`,
          name: item.name || `Image ${index + 1}`,
          url: item.url || item.previewUrl || '',
        }
      })
      .filter((item) => item.url)
  }

  if (typeof value === 'string') {
    return [
      {
        id: 'legacy-0',
        name: 'Image 1',
        url: value,
      },
    ]
  }

  return []
}
