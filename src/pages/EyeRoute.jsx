function EyeRoute() {
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
