import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <>
      <section
        id="home"
        className="hero"
      >
        <div
          className="hero-background home-hero-bg"
        >
          <div className="gradient-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              WELCOME TO FUTURE VISION HOME
            </h1>
            <div className="hero-quote-integrated">
              <p className="hero-quote">
                &ldquo;Who sinned, this man or his parents, that he was born blind?&rdquo;
              </p>
              <p className="hero-quote">
                It was not that this man sinned, or his parents,
              </p>
              <p className="hero-quote">
                but that the works of God might be displayed in him.
              </p>
              <span className="quote-reference">John 9:2&ndash;3</span>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse"></div>
        </div>
      </section>

      <section className="mission-statement">
        <div className="container">
          <div className="mission-content">
            <p className="mission-text">
              <strong>FUTURE VISION SIGHTED-BLIND, INC&apos;s</strong> goal is to empower blind and
              visually impaired children, youths, and adults to access education and be a part of
              mainstream society.
            </p>
          </div>
        </div>
      </section>

      <section id="about" className="story-vision-mission">
        <div className="container">
          <div className="svm-grid">
            <div className="svm-card">
              <div className="svm-header">
                <img src="/images/story.png" alt="Story" className="svm-icon" />
                <h2 className="svm-title">Our Story</h2>
              </div>
              <p className="svm-description">
                Future Vision Home is the flagship project of Future Vision Sighted-Blind Inc., a
                non-profit organization composed of blind members and parents. Our purpose is to
                empower the visually impaired, enabling them to become independent and active
                contributors to society.
              </p>
            </div>
            <div className="svm-card">
              <div className="svm-header">
                <img src="/images/vision.png" alt="Vision" className="svm-icon" />
                <h2 className="svm-title">Our Vision</h2>
              </div>
              <p className="svm-description">
                We envision a country where the blind, visually impaired, and sighted youth are
                encouraged to live lives guided by their own vision, regardless of their gender,
                beliefs, or disabilities. We believe in a future where everyone has the opportunity
                to thrive and succeed.
              </p>
            </div>
            <div className="svm-card">
              <div className="svm-header">
                <img src="/images/mission.png" alt="Mission" className="svm-icon" />
                <h2 className="svm-title">Our Mission</h2>
              </div>
              <p className="svm-description">
                It is our mission to improve access to education by establishing a supportive home
                environment where blind and sighted children live, learn, and develop independence.
                We focus on social, communication, and creative skills that will significantly
                impact their lives and the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="our-work" className="our-work-preview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Work</h2>
            <p className="section-subtitle">
              Comprehensive programs, success stories, and updates from Future Vision Home
            </p>
          </div>
          <div className="work-preview-grid">
            <div className="work-preview-card">
              <img src="/images/what-we-do.png" alt="What We Do" className="work-preview-icon" />
              <h3 className="work-preview-title">What We Do</h3>
              <p className="work-preview-description">
                Braille training, livelihood programs, and comprehensive education support designed
                to empower our Visionistas.
              </p>
              <Link to="/our-work#programs" className="work-preview-link">
                Explore →
              </Link>
            </div>
            <div className="work-preview-card">
              <img src="/images/visionistas.png" alt="Visionistas" className="work-preview-icon" />
              <h3 className="work-preview-title">Visionistas</h3>
              <p className="work-preview-description">
                Success stories of beneficiaries like Jessa Mae, Neslie, and others who have
                overcome challenges and achieved their dreams.
              </p>
              <Link to="/our-work#visionistas" className="work-preview-link">
                Read Stories →
              </Link>
            </div>
            <div className="work-preview-card">
              <img src="/images/news-gallery.png" alt="News & Gallery" className="work-preview-icon" />
              <h3 className="work-preview-title">News & Gallery</h3>
              <p className="work-preview-description">
                Latest newsletters, news updates, and photo gallery showcasing our activities and
                events.
              </p>
              <Link to="/our-work#gallery" className="work-preview-link">
                View Gallery →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
