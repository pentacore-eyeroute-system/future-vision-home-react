import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { newsApi } from '../api/newsApi'

const Article = () => {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const newsResponse = await newsApi.getNews();

    console.log(newsResponse.result)
    setNews(newsResponse.result);
    setLoading(false)
  };

  if (loading) {
    return <div>Loading...</div>
  };

  const article = news.find((news) => news.news_slug === slug)

  if (!article) {
    return <Navigate to="/our-work" replace />
  }

  return (
    <div className="article-page">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">{article.news_title}</h1>
          {article.news_date && <p className="page-subtitle">{new Date(article.news_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        </div>
      </section>

      <div className="container py-5">
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.news_description }}
        />
      </div>
    </div>
  )
}

export default Article
