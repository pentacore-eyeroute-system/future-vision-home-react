import { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { newsApi } from '../api/newsApi'
import { ImageWithSkeleton } from '../components/ImageWithSkeleton'

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

const ArticleSkeleton = () => (
  <div className="article-page animate-pulse" aria-busy="true" aria-label="Loading article">
    <section className="page-header article-page-header">
      <div className="container">
        <div className="h-9 w-20 bg-gray-200/40 rounded mb-4" />
        <div className="h-10 w-3/4 max-w-2xl bg-gray-200/40 rounded" />
      </div>
    </section>

    <div className="container article-container py-8">
      <div className="h-5 w-40 bg-gray-200 rounded mb-6" />

      <section className="article-image-section mb-8">
        <div className="article-featured-wrapper w-full aspect-[16/9] max-w-[1200px] mx-auto bg-gray-200 rounded-xl" />
      </section>

      <div className="article-content space-y-4 max-w-4xl">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  </div>
)

const Article = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [news, setNews] = useState([])
  const [isFetched, setIsFetched] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => {
      controller.abort()
    }
  }, [])

  const fetchData = async (signal) => {
    try {
      const newsResponse = await newsApi.getNews({ signal })
      setNews(newsResponse?.result || [])
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return
      }
      console.error('Failed fetching news article:', error)
    } finally {
      setIsFetched(true)
    }
  }

  const article = news.find((newsItem) => newsItem.news_slug === slug)

  // Redirect to news list if API fetching completes and article does not exist
  if (!article && isFetched) {
    return <Navigate to="/our-work#gallery" replace />
  }

  if (!article) {
    return <ArticleSkeleton />
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
            aria-label="Go back to News and Gallery"
          >
            Back
          </button>
          <h1 className="page-title">{article.news_title}</h1>
        </div>
      </section>

      <div className="container article-container py-8">
        {article.news_date && (
          <p className="article-date-meta">
            {new Date(article.news_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {featuredImage && (
          <section className="article-image-section" aria-label="Article images">
            <ImageWithSkeleton
              className="article-featured-image"
              wrapperClassName="article-featured-wrapper"
              src={featuredImage.url}
              alt={featuredImage.alt}
              width={1200}
              height={675}
              loading="eager"
              fetchpriority="high"
            />

            {galleryImages.length > 0 && (
              <div className="article-image-gallery">
                {galleryImages.map((image) => (
                  <ImageWithSkeleton
                    key={image.id}
                    className="article-gallery-image"
                    wrapperClassName="article-gallery-item-wrapper"
                    src={image.url}
                    alt={image.alt}
                    width={400}
                    height={300}
                    loading="lazy"
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
