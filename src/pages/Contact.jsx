import './Contact.css'

function Contact() {
  return (
    <section className="contact">
      <div className="container">
        <div className="contact-top-row">
          <div className="contact-info">
            <h2 className="info-title">Contact Information</h2>
            <InfoItem
              icon="/images/loc2.png"
              alt="Location"
              title="Address"
              text="A-26 M. L. Quezon Avenue, Bambang, Taguig City, 1637 Metro Manila"
            />
            <InfoItem icon="/images/phone2.png" alt="Phone" title="Phone" text="+63 942 376 9646" />
            <InfoItem
              icon="/images/email2.png"
              alt="Email"
              title="Email"
              text="futurevisionhome27@gmail.com"
            />
            <InfoItem
              icon="/images/website.png"
              alt="Website"
              title="Website"
              text={
                <a href="https://futurevisionhome.org" target="_blank" rel="noreferrer">
                  https://futurevisionhome.org
                </a>
              }
            />
            <InfoItem
              icon="/images/facebook.png"
              alt="Facebook"
              title="Facebook"
              text={
                <a
                  href="https://www.facebook.com/futurevisionsightedblindinc"
                  target="_blank"
                  rel="noreferrer"
                >
                  www.facebook.com/futurevisionsightedblindinc
                </a>
              }
            />
          </div>
          <div className="map-wrapper">
            <h2 className="info-title">Visit Us Here</h2>
            <div className="map-container">
              <iframe
                title="Future Vision Home map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d965.5660841350115!2d121.06915008846894!3d14.52686678316803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8a5c7f41e17%3A0x99b7c26db6ff998a!2sA-26%20M.%20L.%20Quezon%20Avenue%2C%20Taguig%2C%201637%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1768734183526!5m2!1sen!2sph"
                width="100%"
                height="100%"
                className="contact-map-iframe"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoItem({ icon, alt, title, text }) {
  return (
    <div className="info-item">
      <div className="info-icon">
        <img src={icon} alt={alt} className="info-icon-img" />
      </div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default Contact
