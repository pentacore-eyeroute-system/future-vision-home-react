const trim = (value) => value?.trim() ?? ''
const trimTrailingSlash = (value) => trim(value).replace(/\/+$/, '')

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL)

export const buildApiUrl = (path) => {
  if (!path) {
    return apiBaseUrl
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath
}