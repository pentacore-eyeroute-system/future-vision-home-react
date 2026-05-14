import { useEffect, useRef } from 'react'
import { renderGoogleButton } from '../lib/googleIdentity'
import { useReviewAuth } from '../context/reviewAuth'

function GoogleSignInButton() {
  const { googleReady } = useReviewAuth()
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!googleReady || !buttonRef.current) {
      return
    }

    renderGoogleButton(buttonRef.current)
  }, [googleReady])

  return <div ref={buttonRef} className="google-signin-slot" />
}

export default GoogleSignInButton
