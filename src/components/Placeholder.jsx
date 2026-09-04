import './Placeholder.css'

function Placeholder({ title }) {
  return (
    <main className="container placeholder-container">
      <div className="section-header">
        <h1 className="section-title">{title}</h1>
        <p className="section-subtitle">Content coming in the next steps.</p>
      </div>
    </main>
  )
}

export default Placeholder
