import { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { newsApi } from '../api/newsApi'
import { newsArticles as newsArticlesData } from '../data/newsArticles'
import { ImageWithSkeleton } from '../components/ImageWithSkeleton'

const initialNews = (newsArticlesData || []).map((item) => ({
  news_slug: item.slug,
  news_title: item.title,
  news_description: item.excerpt || item.content || '',
  newsPictures: [{ npi_pic_url: item.image }],
  news_date: '2024-12-31',
}))

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
  const [news, setNews] = useState(initialNews)
  const [isFetched, setIsFetched] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const newsResponse = await newsApi.getNews()
      if (newsResponse?.result?.length) {
        setNews(newsResponse.result)
      }
    } catch (error) {
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
    return (
      <div className="article-page min-h-[800px] p-8 text-center text-gray-500">
        Loading article...
      </div>
    )
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

      <div className="container py-5">
        {article.news_date && (
          <p className="article-date-meta">
            {new Date(article.news_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {featuredImage && (
          <section className="article-image-section" aria-label="Article images">
            <ImageWithSkeleton
              className="article-featured-image w-full"
              wrapperClassName="w-full rounded-xl overflow-hidden"
              src={featuredImage.url}
              alt={featuredImage.alt}
              loading="lazy"
            />

            {galleryImages.length > 0 && (
              <div className="article-image-gallery">
                {galleryImages.map((image) => (
                  <ImageWithSkeleton
                    key={image.id}
                    className="article-gallery-image w-full"
                    wrapperClassName="w-full rounded-lg overflow-hidden"
                    src={image.url}
                    alt={image.alt}
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
