function LegacyIframe({ src, title }) {
  return (
    <article className="article-content" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="article-body" style={{ padding: 0 }}>
          <iframe
            title={title}
            src={src}
            style={{ width: '100%', minHeight: '80vh', border: 'none' }}
          />
        </div>
      </div>
    </article>
  )
}

export default LegacyIframe
