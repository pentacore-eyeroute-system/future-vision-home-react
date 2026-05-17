import { useEffect, useState } from 'react'
import { normalizeReview, reviewApi } from '../api/reviewApi'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useReviewAuth } from '../context/reviewAuth'

const demoFeedbacks = [
  {
    id: 1,
    user: { name: 'John Doe' },
    rating: 5,
    comment: 'EyeRoute has completely changed how I navigate my neighborhood. Highly recommend!',
    createdAt: '2024-03-15',
  },
  {
    id: 2,
    user: { name: 'Maria Santos' },
    rating: 4,
    comment: 'Very helpful app. The object detection is quite accurate.',
    createdAt: '2024-03-10',
  },
]

const emptyForm = {
  rating: 5,
  comment: '',
}

const formatReviewDate = (value) => {
  if (!value) {
    return 'Just now'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function EyeRoute() {
  const [feedbacks, setFeedbacks] = useState(() => demoFeedbacks.map((feedback) => normalizeReview(feedback)))
  const [formData, setFormData] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadNotice, setLoadNotice] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const {
    error: authError,
    hasGoogleClientId,
    isAuthenticated,
    isAuthenticating,
    isRestoringSession,
    session,
    signOut,
    user,
  } = useReviewAuth()

  useEffect(() => {
    let isActive = true

    reviewApi
      .getReviews()
      .then((reviews) => {
        if (!isActive) {
          return
        }

        setFeedbacks(reviews)
        setLoadNotice('')
      })
      .catch(() => {
        if (isActive) {
          setLoadNotice('Showing preview reviews until your AWS review endpoint is connected.')
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isAuthenticated || !session) {
      setSubmitError('Sign in with Google before posting a review.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    try {
      const createdReview = await reviewApi.submitReview(session, formData)
      setFeedbacks((currentFeedbacks) => [createdReview, ...currentFeedbacks])
      setFormData(emptyForm)
      setSubmitMessage('Thanks. Your review was submitted through your authenticated session.')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your review right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'G'

  return (
    <>
      <section className="app-landing-section">
        <div className="app-landing-background">
          <div className="wavy-pattern"></div>
        </div>
        <div className="container">
          <div className="app-landing-wrapper">
            <div className="app-landing-content">
              <h2 className="app-landing-title">Intelligent Navigation for a Safer Tomorrow.</h2>
              <p className="app-landing-description">
                Stay connected. Guide your loved ones with visual impairment. Feel reassured wherever they go.
              </p>
              <div className="app-download-buttons">
                <a href="#" target="_blank" rel="noreferrer" aria-label="Get it on Google Play">
                  <img src="/images/google-play.png" alt="Get it on Google Play" className="download-btn-image" />
                </a>
                <a href="#" target="_blank" rel="noreferrer" aria-label="Download on the App Store">
                  <img src="/images/app-store.png" alt="Download on the App Store" className="download-btn-image" />
                </a>
              </div>
            </div>
            <div className="app-landing-visual">
              <div className="phone-mockup phone-mockup-back">
                <div className="phone-screen">
                  <div className="app-screen-content">
                    <div className="app-header"></div>
                    <div className="app-body"></div>
                    <div className="app-footer"></div>
                  </div>
                </div>
              </div>
              <div className="phone-mockup phone-mockup-front">
                <div className="phone-screen">
                  <div className="app-screen-content">
                    <div className="app-header"></div>
                    <div className="app-body"></div>
                    <div className="app-footer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse"></div>
        </div>
      </section>

      <section className="eyeroute-details-section">
        <div className="container">
          <div className="eyeroute-details-content">
            <div className="section-header">
              <h2 className="section-title">About EyeRoute</h2>
              <p className="section-subtitle">
                Your personal navigation companion designed specifically for the visually impaired community
              </p>
            </div>

            <div className="eyeroute-features-grid">
              <Feature
                icon="/images/obj.png"
                title="Object Detection"
                description="Advanced AI technology identifies and alerts you to objects in your path, including people, vehicles, obstacles, and other potential hazards to ensure safe navigation."
              />
              <Feature
                icon="/images/distance.png"
                title="Distance Estimation"
                description="Get accurate distance measurements to objects, obstacles, and destinations. Know exactly how far you are from important points to navigate with precision and confidence."
              />
              <Feature
                icon="/images/voice.png"
                title="Voice Guided Navigation"
                description="Navigate with confidence using clear, detailed voice instructions. EyeRoute provides real-time audio guidance to help you reach your destination safely and independently."
              />
              <Feature
                icon="/images/path.png"
                title="Safe Path"
                description="Identifies walkable terrain vs. obstacles. EyeRoute analyzes your surroundings to distinguish between safe, navigable paths and potential hazards, guiding you along the safest route."
              />
              <Feature
                icon="/images/video.png"
                title="Real-Time Video Stream"
                description="Access live video streaming of your surroundings, allowing your loved ones to see what you see in real-time. Stay connected and get visual assistance when needed for enhanced safety and support."
              />
              <Feature
                icon="/images/loc.png"
                title="Location Tracking"
                description="Get instant, up-to-the-moment location updates with real-time GPS tracking. Stay connected and navigate with confidence knowing your exact position is always current, helping you and your loved ones track your journey in real-time."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="feedback-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">User Feedback</h2>
            <p className="section-subtitle">What our community says about EyeRoute</p>
          </div>

          <div className="feedback-container">
            <div className="feedback-form-wrapper">
              <h3>Share Your Experience</h3>
              <p className="feedback-helper-text">
                Reviews are tied to a Google-verified account before they are sent to your backend.
              </p>

              {!hasGoogleClientId && (
                <div className="feedback-auth-card">
                  <p className="feedback-auth-copy">
                    Add `VITE_GOOGLE_CLIENT_ID` to your frontend env file first. The Google client secret should stay in
                    your backend only.
                  </p>
                </div>
              )}

              {hasGoogleClientId && !isAuthenticated && (
                <div className="feedback-auth-card">
                  <p className="feedback-auth-copy">
                    Sign in with Google, let the frontend send the Google ID token to AWS, and wait for your backend to
                    return your own app session before posting a review.
                  </p>
                  <GoogleSignInButton />
                  {isRestoringSession && <p className="feedback-status">Checking for an existing session...</p>}
                  {isAuthenticating && (
                    <p className="feedback-status">Finishing sign-in and exchanging your Google token with AWS...</p>
                  )}
                </div>
              )}

              {isAuthenticated && (
                <>
                  <div className="feedback-user-card">
                    <div className="feedback-user-identity">
                      {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="feedback-avatar" />
                      ) : (
                        <div className="feedback-avatar feedback-avatar-fallback">{userInitial}</div>
                      )}

                      <div>
                        <p className="feedback-user-name">{user?.name}</p>
                        {user?.email && <p className="feedback-user-email">{user.email}</p>}
                      </div>
                    </div>

                    <button type="button" className="feedback-signout-btn" onClick={() => void signOut()}>
                      Sign Out
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-group">
                      <label htmlFor="rating">Rating</label>
                      <select
                        id="rating"
                        value={formData.rating}
                        onChange={(event) =>
                          setFormData((currentForm) => ({
                            ...currentForm,
                            rating: parseInt(event.target.value, 10),
                          }))
                        }
                      >
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Very Good</option>
                        <option value="3">3 Stars - Good</option>
                        <option value="2">2 Stars - Fair</option>
                        <option value="1">1 Star - Poor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="comment">Your Feedback</label>
                      <textarea
                        id="comment"
                        required
                        rows="4"
                        maxLength="500"
                        value={formData.comment}
                        onChange={(event) =>
                          setFormData((currentForm) => ({
                            ...currentForm,
                            comment: event.target.value,
                          }))
                        }
                        placeholder="Tell us about your experience..."
                      ></textarea>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </>
              )}

              {authError && <p className="feedback-status feedback-status-error">{authError}</p>}
              {submitError && <p className="feedback-status feedback-status-error">{submitError}</p>}
              {submitMessage && <p className="feedback-status feedback-status-success">{submitMessage}</p>}
            </div>

            <div className="feedback-list">
              {loadNotice && <p className="feedback-load-note">{loadNotice}</p>}

              {feedbacks.length === 0 && (
                <div className="feedback-card">
                  <p className="feedback-empty">No reviews yet. Be the first verified user to leave one.</p>
                </div>
              )}

              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-card">
                  <div className="feedback-header">
                    <div className="feedback-reviewer">
                      {feedback.picture ? (
                        <img src={feedback.picture} alt={feedback.name} className="feedback-reviewer-avatar" />
                      ) : (
                        <div className="feedback-reviewer-avatar feedback-avatar-fallback">
                          {feedback.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="feedback-name">{feedback.name}</span>
                    </div>
                    <span className="feedback-date">{formatReviewDate(feedback.date)}</span>
                  </div>
                  <div className="feedback-rating">
                    {'★'.repeat(feedback.rating)}
                    {'☆'.repeat(5 - feedback.rating)}
                  </div>
                  <p className="feedback-comment">{feedback.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Feature({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={icon} alt={title} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  )
}

export default EyeRoute
