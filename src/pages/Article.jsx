import { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { newsApi } from '../api/newsApi'

const getImageUrl = (image) => {
  if (!image) return ''
  if (typeof image === 'string') return image.trim()

  return (
    image.url ||
    image.previewUrl ||
    image.npi_pic_url ||
    image.news_pic_url ||
    image.pic_url ||
    image.path ||
    ''
  ).trim()
}

const getArticleImages = (article) => {
  const candidates = [
    article.newsPictures,
    article.news_images,
    article.news_pic_path,
  ]

  const seenUrls = new Set()

  return candidates
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((image, index) => ({
      id: image?.id || image?.npi_id || image?.name || `article-image-${index}`,
      url: getImageUrl(image),
      alt: image?.name || image?.alt || `${article.news_title} image ${index + 1}`,
    }))
    .filter((image) => {
      if (!image.url || seenUrls.has(image.url)) {
        return false
      }

      seenUrls.add(image.url)
      return true
    })
}

const Article = () => {
  const navigate = useNavigate()
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

  const articleImages = getArticleImages(article)
  const [featuredImage, ...galleryImages] = articleImages

  return (
    <div className="article-page">
      <section className="page-header article-page-header">
        <div className="container">
          <button
            type="button"
            className="article-back-button"
            onClick={() => navigate('/our-work#gallery')}
          >
            Back
          </button>
          <h1 className="page-title">{article.news_title}</h1>
        </div>
      </section>

      <div className="container py-5">
        {article.news_date && (
          <p className="article-date-meta">
            {new Date(article.news_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {featuredImage && (
          <section className="article-image-section" aria-label="Article images">
            <img
              className="article-featured-image"
              src={featuredImage.url}
              alt={featuredImage.alt}
            />

            {galleryImages.length > 0 && (
              <div className="article-image-gallery">
                {galleryImages.map((image) => (
                  <img
                    key={image.id}
                    className="article-gallery-image"
                    src={image.url}
                    alt={image.alt}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="article-content">
          <div
            className="article-body tiptap-content"
            dangerouslySetInnerHTML={{ __html: article.news_description }}
          />
        </div>
      </div>
    </div>
  )
}

export default Article
