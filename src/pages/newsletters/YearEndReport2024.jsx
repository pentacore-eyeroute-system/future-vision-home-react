import { Link } from 'react-router-dom'
import LegacyIframe from './LegacyIframe'

function YearEndReport2024() {
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
          <h1 className="article-title">Year-End Report 2024 and Plans for 2025</h1>
        </div>
      </section>
      <LegacyIframe src="/legacy/year-end-report-2024.html" title="Year-End Report 2024 and Plans for 2025" />
    </>
  )
}

export default YearEndReport2024
