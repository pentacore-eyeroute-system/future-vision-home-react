import { useEffect, useState } from "react";
import { normalizeReview, reviewApi } from "../api/reviewApi";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useReviewAuth } from "../context/reviewAuth";

const demoFeedbacks = [
  {
    id: 1,
    user: { name: "John Doe" },
    rating: 5,
    comment:
      "EyeRoute has completely changed how I navigate my neighborhood. Highly recommend!",
    createdAt: "2024-03-15",
  },
  {
    id: 2,
    user: { name: "Maria Santos" },
    rating: 4,
    comment: "Very helpful app. The object detection is quite accurate.",
    createdAt: "2024-03-10",
  },
];

const emptyForm = {
  rating: 5,
  comment: "",
};

const formatReviewDate = (value) => {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function FeedbackAvatar({ name, picture, className }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "G";
  const safePicture = typeof picture === "string" ? picture.trim() : "";

  useEffect(() => {
    setImageFailed(false);
  }, [safePicture]);

  if (safePicture && !imageFailed) {
    return (
      <img
        src={safePicture}
        alt={name || "Google User"}
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className={`${className} feedback-avatar-fallback`}>{initial}</div>
  );
}

function EyeRoute() {
  const [feedbacks, setFeedbacks] = useState(() =>
    demoFeedbacks.map((feedback) => normalizeReview(feedback)),
  );
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadNotice, setLoadNotice] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    error: authError,
    hasGoogleClientId,
    isAuthenticated,
    isAuthenticating,
    isRestoringSession,
    session,
    signOut,
    user,
  } = useReviewAuth();

  useEffect(() => {
    let isActive = true;

    reviewApi
      .getReviews()
      .then((reviews) => {
        if (!isActive) {
          return;
        }

        setFeedbacks(reviews);
        setLoadNotice("");
      })
      .catch(() => {
        if (isActive) {
          setLoadNotice(
            "Showing preview reviews until your AWS review endpoint is connected.",
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !session) {
      setSubmitError("Sign in with Google before posting a review.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const createdReview = await reviewApi.submitReview(session, formData);
      setFeedbacks((currentFeedbacks) => [createdReview, ...currentFeedbacks]);
      setFormData(emptyForm);
      setSubmitMessage(
        "Thanks. Your review was submitted through your authenticated session.",
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit your review right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="app-landing-section">
        <div className="app-landing-background">
          <div className="wavy-pattern"></div>
        </div>
        <div className="container">
          <div className="app-landing-wrapper">
            <div className="app-landing-content">
              <h2 className="app-landing-title">
                Intelligent Navigation for a Safer Tomorrow.
              </h2>
              <p className="app-landing-description">
                Stay connected. Guide your loved ones with visual impairment.
                Feel reassured wherever they go.
              </p>
              <div className="app-download-buttons">
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Get it on Google Play"
                >
                  <img
                    src="/images/google-play.png"
                    alt="Get it on Google Play"
                    className="download-btn-image"
                  />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download on the App Store"
                >
                  <img
                    src="/images/app-store.png"
                    alt="Download on the App Store"
                    className="download-btn-image"
                  />
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
                Your personal navigation companion designed specifically for the
                visually impaired community
              </p>
            </div>

            <div className="eyeroute-features-grid">
              <Feature
                icon="/images/obj.png"
                title="Object Detection"
                description="Detects and classifies relevant objects in the live camera feed. Provides contextual awareness for visually impaired users and helps detect hazards."
              />
              <Feature
                icon="/images/audio_feedback.png"
                title="Audio Feedback Module"
                description="Converts system-generated text alerts and guidance into spoken audio so the PVI can receive real-time instructions and warnings."
              />
              <Feature
                icon="/images/voice.png"
                title="Voice Guided Navigation"
                description="Converts system-generated guidance and alerts into spoken audio so users can receive real-time instructions and warnings."
              />
              <Feature
                icon="/images/path.png"
                title="Safe Path"
                description="Identifies potentially walkable areas by analyzing the lower camera frame and detecting visible obstacles or interruptions along the user's path."
              />
              <Feature
                icon="/images/video.png"
                title="Real-Time Video Stream"
                description="Provides a live video stream of the user's surroundings to the guardian mobile application for remote monitoring and assistance."
              />
              <Feature
                icon="/images/loc.png"
                title="Destination Navigation"
                description="Guides the user toward a selected destination by providing walking directions based on the user's spoken destination and current location."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="feedback-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">User Feedback</h2>
            <p className="section-subtitle">
              What our community says about EyeRoute
            </p>
          </div>

          <div className="feedback-container">
            <div className="feedback-form-wrapper">
              <h3>Share Your Experience</h3>
              <p className="feedback-helper-text">
                Reviews are tied to a Google-verified account before they are
                sent to your backend.
              </p>

              {!hasGoogleClientId && (
                <div className="feedback-auth-card">
                  <p className="feedback-auth-copy">
                    Add `VITE_GOOGLE_CLIENT_ID` to your frontend env file first.
                    The Google client secret should stay in your backend only.
                  </p>
                </div>
              )}

              {hasGoogleClientId && !isAuthenticated && (
                <div className="feedback-auth-card">
                  <p className="feedback-auth-copy">
                    Sign in with Google, let the frontend send the Google ID
                    token to AWS, and wait for your backend to return your own
                    app session before posting a review.
                  </p>
                  <GoogleSignInButton />
                  {isRestoringSession && (
                    <p className="feedback-status">
                      Checking for an existing session...
                    </p>
                  )}
                  {isAuthenticating && (
                    <p className="feedback-status">
                      Finishing sign-in and exchanging your Google token with
                      AWS...
                    </p>
                  )}
                </div>
              )}

              {isAuthenticated && (
                <>
                  <div className="feedback-user-card">
                    <div className="feedback-user-identity">
                      <FeedbackAvatar
                        name={user?.name}
                        picture={user?.picture}
                        className="feedback-avatar"
                      />

                      <div>
                        <p className="feedback-user-name">{user?.name}</p>
                        {user?.email && (
                          <p className="feedback-user-email">{user.email}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="feedback-signout-btn"
                      onClick={() => void signOut()}
                    >
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

                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </form>
                </>
              )}

              {authError && (
                <p className="feedback-status feedback-status-error">
                  {authError}
                </p>
              )}
              {submitError && (
                <p className="feedback-status feedback-status-error">
                  {submitError}
                </p>
              )}
              {submitMessage && (
                <p className="feedback-status feedback-status-success">
                  {submitMessage}
                </p>
              )}
            </div>

            <div className="feedback-list">
              {loadNotice && <p className="feedback-load-note">{loadNotice}</p>}

              {feedbacks.length === 0 && (
                <div className="feedback-card">
                  <p className="feedback-empty">
                    No reviews yet. Be the first verified user to leave one.
                  </p>
                </div>
              )}

              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-card">
                  <div className="feedback-header">
                    <div className="feedback-reviewer">
                      <FeedbackAvatar
                        name={feedback.name}
                        picture={feedback.picture}
                        className="feedback-reviewer-avatar"
                      />
                      <span className="feedback-name">{feedback.name}</span>
                    </div>
                    <span className="feedback-date">
                      {formatReviewDate(feedback.date)}
                    </span>
                  </div>
                  <div className="feedback-rating">
                    {"★".repeat(feedback.rating)}
                    {"☆".repeat(5 - feedback.rating)}
                  </div>
                  <p className="feedback-comment">{feedback.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
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
  );
}

export default EyeRoute;
