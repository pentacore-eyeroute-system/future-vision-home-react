import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { visionistaApi } from '../api/visionistaApi'
import { newsArticles } from '../data/newsArticles'
import { galleryCategories } from '../data/gallery'
import { galleryApi } from '../api/galleryApi'
import { newsApi } from '../api/newsApi'
import './OurWork.css'

const tabOrder = ['what-we-do', 'visionistas', 'gallery']

const getStoryParagraphs = (story = '') => (
  String(story)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
)

const getPlainText = (value = '') => {
  const parser = new DOMParser()
  return parser.parseFromString(value, 'text/html').body.textContent || ''
}

const mapHashToTab = (hash) => {
  if (!hash) return null
  const clean = hash.replace(/^#/, '').toLowerCase()
  if (clean === 'visionistas') return 'visionistas'
  if (clean === 'gallery' || clean === 'news' || clean === 'news-gallery') return 'gallery'
  if (clean === 'what-we-do' || clean === 'programs') return 'what-we-do'
  return null
}

function OurWork() {
  const location = useLocation()
  const [visionistas, setVisionistas] = useState([])
  const [news, setNews] = useState([])
  const [galleries, setGalleries] = useState([])
  const [activeTab, setActiveTab] = useState(() => mapHashToTab(location.hash) || 'what-we-do')
  const [selectedVisionista, setSelectedVisionista] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const tabFromHash = mapHashToTab(location.hash)
    if (tabFromHash && tabFromHash !== activeTab) {
      setActiveTab(tabFromHash)
    }
  }, [location.hash])

  useEffect(() => {
    if (!selectedVisionista) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedVisionista(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedVisionista])

  const fetchData = async () => {
    const visionistaResponse = await visionistaApi.getVisionistas().catch(() => ({ result: [] }))
    const newsResponse = await newsApi.getNews().catch(() => ({ result: [] }))
    const galleryResponse = await galleryApi.getGalleries().catch(() => ({ result: [] }))

    setVisionistas(visionistaResponse?.result || [])
    setNews(newsResponse?.result || [])
    setGalleries(galleryResponse?.result || [])
  }

  const filteredNews = useMemo(() => {
    if (!query.trim()) return news
    const q = query.toLowerCase()
    return news.filter(
      (item) =>
        item.news_title?.toLowerCase().includes(q) ||
        item.news_description?.toLowerCase().includes(q)
    )
  }, [query, news])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Our Work</h1>
          <p className="page-subtitle">
            Empowering Blind and Visually Impaired Individuals Through Comprehensive Programs,
            Support, and Community Integration.
          </p>
        </div>
      </section>

      <section className="work-tabs">
        <div className="container">
          <div className="tabs-nav">
            {tabOrder.map((tab) => (
              <button
                key={tab}
                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab === 'what-we-do' && 'What We Do'}
                {tab === 'visionistas' && 'Visionistas'}
                {tab === 'gallery' && 'News and Gallery'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeTab === 'what-we-do' && (
        <section id="what-we-do" className="work-section active">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">What We Do</h2>
              <p className="section-subtitle">
                Comprehensive training and support programs at Future Vision Home.
              </p>
            </div>

            <div className="what-we-do-content-wrapper">
              <div className="about-content our-work-about-content">
                <div className="programs-cards-grid our-work-programs-grid">
                  <ProgramCard
                    icon="/images/braille.png"
                    title="Braille Training"
                    description="Teaching blind and visually impaired individuals how to read and write in Braille, providing essential literacy skills for independence."
                  />
                  <ProgramCard
                    icon="/images/household.png"
                    title="Household Chores"
                    description="Training in essential household tasks and responsibilities to build confidence and self-sufficiency in daily life."
                  />
                  <ProgramCard
                    icon="/images/daily.png"
                    title="Daily Living Skills"
                    description="Comprehensive training in essential daily living skills to prepare individuals for independent living in society."
                  />
                  <ProgramCard
                    icon="/images/mobility.png"
                    title="Orientation and Mobility"
                    description="Teaching safe and independent movement skills, allowing individuals to navigate and move around the community confidently."
                  />
                </div>

                <div className="about-description our-work-description-spacing">
                  <p>
                    These comprehensive training programs prepare blind and visually impaired
                    individuals for their life in society at large.
                  </p>
                </div>

                <div className="about-description our-work-description-spacing">
                  <p>
                    At present, more than fifty blind/visually impaired individuals have directly
                    benefited. Some are now attending the Public Schools in Taguig City. One is
                    successful in University and another one is entering. At the Home we are not only
                    training the vision impaired with knowledge and skills in Braille but we also
                    provide livelihood trainings for adult vision impaired through the &quot;Economic
                    Empowerment Training Through Massage Training.&quot;
                  </p>
                </div>

                <div className="about-description our-work-description-spacing">
                  <p className="our-work-pandemic-intro">
                    Now that we are experiencing the effect of Corona Pandemic, we at the home are
                    holding two Projects:
                  </p>
                </div>

                <div className="about-description our-work-project-item-1">
                  <p>1. The School at the Future Vision Home project where the blind students are housed at the home and,</p>
                </div>

                <div className="about-description our-work-project-item-2">
                  <p>2. The Teaching at their home project, where a teacher goes to the house of the student.</p>
                </div>

                <div className="about-description">
                  <p>Of course we keep all Covid-19 safety regulations in place.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'visionistas' && (
        <section id="visionistas" className="work-section active">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Visionistas</h2>
              <p className="section-subtitle">
                <span className="visionistas-label">Visionistas</span>: A name given to someone who
                stands for and upholds the Vision and Mission of Future Vision Sighted-Blind Inc.
              </p>
            </div>

            <div className="visionistas-content-wrapper">
              <h3 className="visionistas-stories-heading">
                INSPIRING STORIES OF THE BENEFICIARIES OF THE PROJECT
              </h3>
              <div className="visionistas-grid">
                {visionistas.map((v) => (
                  <button
                    key={v.vis_fullname}
                    className="visionista-card visionista-card-btn"
                    type="button"
                    onClick={() => setSelectedVisionista(v)}
                    aria-haspopup="dialog"
                  >
                    <div className="visionista-icon">
                      {v.vis_pic_url ? (
                        <img
                          src={v.vis_pic_url}
                          alt={v.vis_fullname}
                          className="visionista-card-photo"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/images/daily.png'
                          }}
                        />
                      ) : (
                        <div className="visionista-avatar-fallback" aria-label={v.vis_fullname}>
                          {v.vis_fullname?.charAt(0) || 'V'}
                        </div>
                      )}
                    </div>
                    <h3 className="visionista-name">{v.vis_fullname}</h3>
                    <p className="visionista-story visionista-story-preview">{v.vis_story}</p>
                    <span className="visionista-readmore" aria-hidden="true">
                      Read Story →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedVisionista && (
            <div
              className="visionista-dialog-overlay"
              role="presentation"
              onClick={() => setSelectedVisionista(null)}
            >
            <div
              className="visionista-dialog open"
              role="dialog"
              aria-modal="true"
              aria-labelledby="visionista-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="visionista-dialog-header">
                <h3 className="visionista-dialog-title" id="visionista-dialog-title">{selectedVisionista.vis_fullname}</h3>
                <button
                  type="button"
                  className="visionista-dialog-close"
                  aria-label="Close dialog"
                  onClick={() => setSelectedVisionista(null)}
                >
                  ×
                </button>
              </div>
              <div className="visionista-dialog-body">
                <div className="visionista-modal-photo-column">
                  {selectedVisionista.vis_pic_url ? (
                    <img
                      className="visionista-modal-photo"
                      src={selectedVisionista.vis_pic_url}
                      alt={selectedVisionista.vis_fullname}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/images/daily.png'
                      }}
                    />
                  ) : (
                    <div
                      className="visionista-avatar-fallback visionista-modal-avatar-fallback"
                      aria-label={selectedVisionista.vis_fullname}
                    >
                      {selectedVisionista.vis_fullname?.charAt(0) || 'V'}
                    </div>
                  )}
                </div>
                <div className="visionista-story-content">
                  <span className="visionista-story-label">Visionista Story</span>
                  {getStoryParagraphs(selectedVisionista.vis_story).map((paragraph, index) => (
                    <p key={`${selectedVisionista.vis_fullname}-story-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'gallery' && (
        <section id="gallery" className="work-section active">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">News and Gallery</h2>
              <p className="section-subtitle">
                We share news about Future Vision Home activities in quarterly newsletters.
              </p>
            </div>

            <div className="gallery-content-wrapper">
              <div className="news-search">
                <form className="search-form" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="search"
                    placeholder="Search here..."
                    className="search-input"
                    aria-label="Search newsletters"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </form>
              </div>

              <div className="news-articles">
                <div className="news-featured-row">
                  {filteredNews.map((article) => (
                    <NewsCard key={article.news_slug} article={article} />
                  ))}
                </div>
                {/* <div className="news-featured-row">
                  {filteredNews.slice(2, 4).map((article) => (
                    <NewsCard key={article.news_slug} article={article} />
                  ))}
                </div>
                <div className="news-featured-row">
                  {filteredNews.slice(4, 5).map((article) => (
                    <NewsCard key={article.news_slug} article={article} />
                  ))}
                </div> */}
                {filteredNews.length === 0 && (
                  <div className="no-results">
                    <h2>No Results Found</h2>
                    <p>We couldn&apos;t find anything matching your search.</p>
                  </div>
                )}
              </div>

              <div className="gallery-section">
                <h3 className="gallery-section-title">Photo Gallery</h3>
                {galleries.sort((a, b) => new Date(b.gal_date) - new Date(a.gal_date)).map((gallery) => (
                  <div className="gallery-category" key={gallery.gal_title}>
                    <h4 className="gallery-category-title">{gallery.gal_title}</h4>
                    <p className="gallery-date">
                      {new Date(gallery.gal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {gallery.gal_description && (
                      <p className="gallery-description">{gallery.gal_description}</p>
                    )}
                    <div className="gallery-grid">
                      {gallery.galleryPictures.map((img) => (
                        <button
                          key={img}
                          className="gallery-item"
                          type="button"
                          onClick={() => setLightboxImage(img)}
                        >
                          <img src={decodeURI(img.gpi_pic_url)} alt={gallery.title} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {lightboxImage && (
        <div className="image-lightbox" aria-modal="true" role="dialog">
          <div className="image-lightbox-content">
            <button
              type="button"
              className="image-lightbox-nav image-lightbox-nav--prev"
              aria-label="Close image"
              onClick={() => setLightboxImage(null)}
            >
              ×
            </button>
            <div className="image-lightbox-frame">
              <img id="imageLightboxImg" className="image-lightbox-img" src={decodeURI(lightboxImage)} alt="" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ProgramCard({ icon, title, description }) {
  return (
    <div className="program-card-item">
      <div className="program-card-icon">
        <img src={icon} alt={title} className="program-icon-img" />
      </div>
      <h3 className="program-card-title">{title}</h3>
      <p className="program-card-description">{description}</p>
    </div>
  )
}

function NewsCard({ article }) {
  return (
    <article className="news-article">
      <div className="news-image">
        <img src={article.newsPictures?.[0]?.npi_pic_url} alt={`${article.news_title} cover`} className="news-cover-image" />
      </div>
      <div className="news-content">
        <h2 className="news-article-title">{article.news_title}</h2>
        {article.news_date && (
          <p className="news-date">
            {new Date(article.news_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <p className="news-article-excerpt">{getPlainText(article.news_description)}</p>
        <Link to={`/news/${article.news_slug}`} className="news-read-more">
          Read More
        </Link>
      </div>
    </article>
  )
}

export default OurWork
