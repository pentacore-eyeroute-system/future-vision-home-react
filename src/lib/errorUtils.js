/**
 * Extracts a user-friendly error message from an API or Axios error object.
 * Specifically detects HTTP 413 (Request Entity Too Large / Content Too Large)
 * and formats a clear message for image upload size limits.
 *
 * @param {Error|object} error - The caught error object
 * @param {string} defaultMessage - Fallback error message
 * @returns {string} User-facing error message
 */
export function extractErrorMessage(error, defaultMessage = 'An unexpected error occurred.') {
  if (!error) return defaultMessage

  const status = error.response?.status || error.status

  // Specific check for 413 Request Entity Too Large / Content Too Large
  if (
    status === 413 ||
    (error.message && error.message.includes('413')) ||
    (typeof error.response?.data === 'string' && error.response.data.includes('413'))
  ) {
    return 'File size too large. The uploaded image(s) exceed the maximum server upload size limit. Please select smaller images or compress them before uploading.'
  }

  if (error.response?.data?.error && typeof error.response.data.error === 'string') {
    return error.response.data.error
  }

  if (error.response?.data?.message && typeof error.response.data.message === 'string') {
    return error.response.data.message
  }

  if (error.message) {
    return error.message
  }

  return defaultMessage
}
