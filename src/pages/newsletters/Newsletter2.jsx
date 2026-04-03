import { Link } from 'react-router-dom'
import LegacyIframe from './LegacyIframe'

function Newsletter2() {
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
          <h1 className="article-title">Quarterly Newsletter 2 – 2023</h1>
        </div>
      </section>
      <LegacyIframe src="/legacy/quarterly-newsletter-2-2023.html" title="Quarterly Newsletter 2 – 2023" />
    </>
  )
}

export default Newsletter2
