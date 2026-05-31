function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <p className="footer-location">
              <img src="/images/location.png" alt="Location" className="footer-icon" /> 26A ML Quezon
              Ave., Bambang, Taguig City Philippines
            </p>
            <p className="footer-phone">
              <img src="/images/phone.png" alt="Phone" className="footer-icon" /> +63 942 376 9646
            </p>
          </div>
          <div className="footer-actions">
            <div className="footer-social">
              <a
                href="https://www.facebook.com/futurevisionsightedblindinc"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="social-icon"
              >
                <img src="/images/fb.png" alt="Facebook" className="social-icon-img" />
              </a>
              <a
                href="mailto:futurevisionhome27@gmail.com"
                aria-label="Email"
                className="social-icon"
              >
                <img src="/images/email.png" alt="Email" className="social-icon-img" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright © 2022 | futurevisionhome.org</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
