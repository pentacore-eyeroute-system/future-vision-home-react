import { useEffect, useState, useCallback } from "react";
import { getApiErrorMessage, normalizeReview, reviewApi } from "../api/reviewApi";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useReviewAuth } from "../context/reviewAuth";
import { VITE_API_BASE_URL } from "../config/apiUrlConfig";

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

const canManageReview = (feedback, user) => {
  if (!feedback || !user) {
    return false;
  }

  return (
    (feedback.userId && feedback.userId === user.id) ||
    (feedback.email && feedback.email === user.email)
  );
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
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [reviewActionError, setReviewActionError] = useState("");
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null);

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

  const fetchReviews = useCallback(async () => {
    try {
      const reviews = await reviewApi.getReviews();
      const normalized = reviews.map(normalizeReview);
      setFeedbacks(normalized);
      setLoadNotice("");
    } catch {
      setLoadNotice("");
    }
  }, []);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (!submitMessage) return;
    const timer = setTimeout(() => {
      setSubmitMessage("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [submitMessage]);

  // Auto-dismiss submission error after 5 seconds
  useEffect(() => {
    if (!submitError) return;
    const timer = setTimeout(() => {
      setSubmitError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [submitError]);

  // Auto-dismiss review action error after 5 seconds
  useEffect(() => {
    if (!reviewActionError) return;
    const timer = setTimeout(() => {
      setReviewActionError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [reviewActionError]);

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
      // Constructs payload properties matching the backend schema expectation
      const payload = {
        rating: formData.rating,
        feedback: formData.comment,
      };

      const rawReview = await reviewApi.submitReview(session, payload);
      const normalized = {
        ...normalizeReview(rawReview),
        name: user?.name || 'Anonymous User',
        picture: user?.picture || '',
        email: user?.email || '',
        userId: user?.id || null,
      };

      setFeedbacks((currentFeedbacks) => {
        const existingIndex = currentFeedbacks.findIndex(
          (item) =>
            (normalized.id && item.id === normalized.id) ||
            (normalized.userId && item.userId === normalized.userId) ||
            (normalized.email && user?.email && item.email && item.email.toLowerCase() === user.email.toLowerCase())
        );

        if (existingIndex !== -1) {
          const updated = [...currentFeedbacks];
          updated[existingIndex] = { ...updated[existingIndex], ...normalized };
          return updated;
        }

        return [normalized, ...currentFeedbacks];
      });

      setFormData(emptyForm);
      setSubmitMessage("Thanks! Your review was successfully published.");
      void fetchReviews();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Unable to submit your review right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (feedback) => {
    setReviewActionError("");
    setOpenMenuReviewId(null);
    setEditingReviewId(feedback.id);
    setEditForm({
      rating: feedback.rating,
      comment: feedback.comment,
    });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditForm(emptyForm);
    setReviewActionError("");
  };

  const handleUpdateReview = async (event, reviewId) => {
    event.preventDefault();

    if (!session) {
      setReviewActionError("Sign in again before updating your review.");
      return;
    }

    setUpdatingReviewId(reviewId);
    setReviewActionError("");

    try {
      const payload = {
        rating: editForm.rating,
        feedback: editForm.comment,
      };

      const rawUpdated = await reviewApi.updateReview(session, reviewId, payload);
      const normalizedUpdated = {
        ...normalizeReview(rawUpdated),
        id: reviewId,
        rating: Number(editForm.rating),
        comment: editForm.comment,
        name: user?.name || 'Anonymous User',
        picture: user?.picture || '',
        email: user?.email || '',
        userId: user?.id || null,
      };

      setFeedbacks((currentFeedbacks) =>
        currentFeedbacks.map((feedback) =>
          feedback.id === reviewId ? normalizedUpdated : feedback
        )
      );
      handleCancelEdit();
      setSubmitMessage("Your review was successfully updated.");
      void fetchReviews();
    } catch (error) {
      setReviewActionError(
        getApiErrorMessage(error, "Unable to update your review right now.")
      );
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!session) {
      setReviewActionError("Sign in again before deleting your review.");
      return;
    }

    const shouldDelete = window.confirm("Delete this review? This action cannot be undone.");
    if (!shouldDelete) return;

    setOpenMenuReviewId(null);
    setDeletingReviewId(reviewId);
    setReviewActionError("");

    try {
      await reviewApi.deleteReview(session, reviewId);
      
      // Filter out deleted feedback row items dynamically from UI state arrays
      setFeedbacks((currentFeedbacks) =>
        currentFeedbacks.filter((feedback) => feedback.id !== reviewId)
      );
      
      if (editingReviewId === reviewId) {
        handleCancelEdit();
      }
      setSubmitMessage("Your review has been successfully removed.");
      void fetchReviews();
    } catch (error) {
      setReviewActionError(
        getApiErrorMessage(error, "Unable to delete your review right now.")
      );
    } finally {
      setDeletingReviewId(null);
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
            <div className={`feedback-form-wrapper${!isAuthenticated ? " feedback-form-wrapper-compact" : ""}`}>
              <p className="feedback-helper-text">
                Sign in with Google to leave a review.
              </p>

              {!hasGoogleClientId && (
                <div className="feedback-auth-card">
                  <p className="feedback-auth-copy">
                    Google sign-in is not available right now. Please try again later.
                  </p>
                </div>
              )}

              {hasGoogleClientId && !isAuthenticated && (
                <div className="feedback-auth-card">
                  <GoogleSignInButton />
                  {isRestoringSession && (
                    <p className="feedback-status">
                      Checking for an existing session...
                    </p>
                  )}
                  {isAuthenticating && (
                    <p className="feedback-status">
                      Finishing sign-in...
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
                        {user?.email && user.email !== user?.name && (
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
                        onChange={(event) => {
                          setSubmitError("");
                          setSubmitMessage("");
                          setFormData((currentForm) => ({
                            ...currentForm,
                            rating: parseInt(event.target.value, 10),
                          }));
                        }}
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
                        onChange={(event) => {
                          setSubmitError("");
                          setSubmitMessage("");
                          setFormData((currentForm) => ({
                            ...currentForm,
                            comment: event.target.value,
                          }));
                        }}
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
              {reviewActionError && (
                <p className="feedback-status feedback-status-error">
                  {reviewActionError}
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
                    <div className="feedback-meta-actions">
                      <span className="feedback-date">
                        {formatReviewDate(feedback.date)}
                      </span>
                      {canManageReview(feedback, user) && editingReviewId !== feedback.id && (
                        <div className="feedback-overflow" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            className="feedback-overflow-btn"
                            aria-label="Review actions"
                            aria-haspopup="menu"
                            aria-expanded={openMenuReviewId === feedback.id}
                            onClick={() =>
                              setOpenMenuReviewId((currentId) =>
                                currentId === feedback.id ? null : feedback.id,
                              )
                            }
                          >
                            <span aria-hidden="true">...</span>
                          </button>
                          {openMenuReviewId === feedback.id && (
                            <div className="feedback-overflow-menu" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                className="feedback-overflow-item"
                                onClick={() => handleStartEdit(feedback)}
                              >
                                Edit Review
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="feedback-overflow-item feedback-overflow-danger"
                                disabled={deletingReviewId === feedback.id}
                                onClick={() => handleDeleteReview(feedback.id)}
                              >
                                {deletingReviewId === feedback.id ? "Deleting..." : "Delete Review"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="feedback-rating">
                    {"★".repeat(feedback.rating)}
                    {"☆".repeat(5 - feedback.rating)}
                  </div>
                  <p className={`feedback-comment${editingReviewId === feedback.id ? " feedback-comment-editing" : ""}`}>
                    {feedback.comment}
                  </p>
                  {editingReviewId === feedback.id && (
                    <form
                      className="feedback-edit-form"
                      onSubmit={(event) => handleUpdateReview(event, feedback.id)}
                    >
                      <label htmlFor={`edit-rating-${feedback.id}`}>Rating</label>
                      <select
                        id={`edit-rating-${feedback.id}`}
                        value={editForm.rating}
                        onChange={(event) => {
                          setReviewActionError("");
                          setEditForm((currentForm) => ({
                            ...currentForm,
                            rating: parseInt(event.target.value, 10),
                          }));
                        }}
                      >
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Very Good</option>
                        <option value="3">3 Stars - Good</option>
                        <option value="2">2 Stars - Fair</option>
                        <option value="1">1 Star - Poor</option>
                      </select>

                      <label htmlFor={`edit-comment-${feedback.id}`}>Review</label>
                      <textarea
                        id={`edit-comment-${feedback.id}`}
                        required
                        rows="4"
                        maxLength="500"
                        value={editForm.comment}
                        onChange={(event) => {
                          setReviewActionError("");
                          setEditForm((currentForm) => ({
                            ...currentForm,
                            comment: event.target.value,
                          }));
                        }}
                      ></textarea>

                      {editingReviewId === feedback.id && reviewActionError && (
                        <p className="feedback-status feedback-status-error" style={{ margin: "0.75rem 0" }}>
                          {reviewActionError}
                        </p>
                      )}

                      <div className="feedback-edit-actions">
                        <button
                          type="submit"
                          className="feedback-action-btn feedback-action-primary"
                          disabled={updatingReviewId === feedback.id}
                        >
                          {updatingReviewId === feedback.id ? "Updating..." : "Update Review"}
                        </button>
                        <button
                          type="button"
                          className="feedback-action-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
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
