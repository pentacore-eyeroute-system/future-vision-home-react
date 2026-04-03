import { Link } from 'react-router-dom'
import LegacyIframe from './LegacyIframe'

function Newsletter1() {
  return (
    <>
      <section className="article-header">
        <div className="container">
          <Link to="/our-work#gallery" className="article-back-link">
            <span className="article-back-icon" aria-hidden="true">
              ←
            </span>
            <span className="article-back-text">News and Gallery</span>
          </Link>
          <h1 className="article-title">Quarterly Newsletter 1 – 2025</h1>
        </div>
      </section>
      <LegacyIframe src="/legacy/quarterly-newsletter-1-2025.html" title="Quarterly Newsletter 1 – 2025" />
    </>
  )
}

export default Newsletter1
