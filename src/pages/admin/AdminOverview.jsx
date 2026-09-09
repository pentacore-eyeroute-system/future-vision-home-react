import { useState, useEffect } from 'react'
import { visionistaApi } from '../../api/visionistaApi'
import { partnerApi } from '../../api/partnerApi'
import { newsApi } from '../../api/newsApi'
import { galleryApi } from '../../api/galleryApi'

function AdminOverview() {
  const [stats, setStats] = useState({
    visionistas: 0,
    partners: 0,
    news: 0,
    gallery: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    setIsLoading(true)
    try {
      const [vRes, pRes, nRes, gRes] = await Promise.allSettled([
        visionistaApi.getVisionistas(),
        partnerApi.getPartners(),
        newsApi.getNews(),
        galleryApi.getGalleries()
      ])

      setStats({
        visionistas: vRes.status === 'fulfilled' ? (vRes.value?.result?.length || 0) : 0,
        partners: pRes.status === 'fulfilled' ? (pRes.value?.result?.length || 0) : 0,
        news: nRes.status === 'fulfilled' ? (nRes.value?.result?.length || 0) : 0,
        gallery: gRes.status === 'fulfilled' ? (gRes.value?.result?.length || 0) : 0
      })
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }

  const cards = [
    { label: 'Visionistas', count: stats.visionistas, icon: '👥', color: 'bg-blue-500' },
    { label: 'Partners', count: stats.partners, icon: '🤝', color: 'bg-green-500' },
    { label: 'News Articles', count: stats.news, icon: '📰', color: 'bg-purple-500' },
    { label: 'Gallery Items', count: stats.gallery, icon: '🖼️', color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`stat-skel-${i}`}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4"
              >
                <div className="skeleton-box w-12 h-12 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton-box h-4 w-24 rounded" />
                  <div className="skeleton-box h-7 w-12 rounded" />
                </div>
              </div>
            ))
          : cards.map((card) => (
              <div key={card.label} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg`}>
                  <span aria-hidden="true">{card.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{card.count}</h3>
                </div>
              </div>
            ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Welcome to the Dashboard</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
          From here you can manage all the content of the Future Vision Home website. 
          Use the sidebar to navigate between different sections. You can add new members, 
          update partner information, post news updates, and manage the photo gallery.
        </p>
      </div>
    </div>
  )
}

export default AdminOverview
