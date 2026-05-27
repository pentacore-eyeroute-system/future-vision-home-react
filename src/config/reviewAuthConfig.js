import { buildApiUrl } from "./apiUrlConfig.js";

const trim = (value) => value?.trim() ?? ''
const trimTrailingSlash = (value) => trim(value).replace(/\/+$/, '')

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL)
const googleClientId = trim(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export const reviewAuthConfig = {
  apiBaseUrl,
  googleClientId,
  hasGoogleClientId: Boolean(googleClientId),
  endpoints: {
    authSession: trim(import.meta.env.VITE_AUTH_SESSION_ENDPOINT),
  },
  buildApiUrl,
}
