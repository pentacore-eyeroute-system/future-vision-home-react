import { useParams, Navigate } from 'react-router-dom'
import { newsArticles } from '../data/newsArticles'

const Article = () => {
  const { slug } = useParams()
  const article = newsArticles.find((a) => a.slug === slug)

  if (!article) {
    return <Navigate to="/our-work" replace />
  }

  return (
    <div className="article-page">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">{article.title}</h1>
          {article.date && <p className="page-subtitle">{article.date}</p>}
        </div>
      </section>

      <div className="container py-5">
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  )
}

export default Article
