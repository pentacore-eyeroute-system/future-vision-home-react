const GOOGLE_SCRIPT_ID = 'google-identity-services'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let googleScriptPromise
let activeClientId = ''
let credentialHandler = null

const isBrowser = () => typeof window !== 'undefined'

export const loadGoogleIdentityServices = () => {
  if (!isBrowser()) {
    return Promise.reject(new Error('Google Sign-In can only load in the browser.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In.')), { once: true })
        return
      }

      const script = document.createElement('script')
      script.id = GOOGLE_SCRIPT_ID
      script.src = GOOGLE_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.google)
      script.onerror = () => reject(new Error('Failed to load Google Sign-In.'))
      document.head.appendChild(script)
    })
  }

  return googleScriptPromise
}

export const initializeGoogleIdentity = async ({ clientId, onCredential }) => {
  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID.')
  }

  credentialHandler = onCredential
  const google = await loadGoogleIdentityServices()

  if (!google?.accounts?.id) {
    throw new Error('Google Sign-In is unavailable right now.')
  }

  if (activeClientId !== clientId) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => credentialHandler?.(response),
      context: 'signin',
      ux_mode: 'popup',
      use_fedcm_for_button: true,
      itp_support: true,
    })

    activeClientId = clientId
  }

  return google
}

export const renderGoogleButton = (element, options = {}) => {
  if (!isBrowser() || !window.google?.accounts?.id || !element) {
    return
  }

  const width = 220

  element.innerHTML = ''
  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'outline',
    text: 'continue_with',
    shape: 'pill',
    size: 'large',
    width,
    ...options,
  })
}

export const disableGoogleAutoSelect = () => {
  if (!isBrowser()) {
    return
  }

  window.google?.accounts?.id?.disableAutoSelect?.()
}
