import { useState, useEffect, useMemo, useCallback } from 'react'
import { galleryApi } from '../../api/galleryApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminToast from '../../components/admin/AdminToast'
import { recentlyDeletedApi } from '../../api/recentlyDeletedApi'
import { extractErrorMessage } from '../../lib/errorUtils'
import './AdminDeleted.css'

const FILTERS = [
  { key: 'visionista', label: 'Visionistas' },
  { key: 'news', label: 'News' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'partner', label: 'Partners' },
]

const matchesFilter = (item, filter) => {
  if (filter === 'all') return true
  return item.type === filter
}

const formatType = (type) => {
  if (type === 'visionista') return 'Visionista'
  if (type === 'news') return 'News'
  if (type === 'gallery') return 'Gallery'
  return 'Partner'
}

function AdminDeleted() {
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('visionista')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    try {
      const [visionistasRes, newsRes, galleriesRes, partnersRes] = await Promise.allSettled([
        recentlyDeletedApi.getDeletedVisionistas(),
        recentlyDeletedApi.getDeletedNews(),
        recentlyDeletedApi.getDeletedGalleries(),
        recentlyDeletedApi.getDeletedPartners(),
      ])

      const visionistas = visionistasRes.status === 'fulfilled' ? (visionistasRes.value?.result || []) : []
      const news = newsRes.status === 'fulfilled' ? (newsRes.value?.result || []) : []
      const galleries = galleriesRes.status === 'fulfilled' ? (galleriesRes.value?.result || []) : []
      const partners = partnersRes.status === 'fulfilled' ? (partnersRes.value?.result || []) : []

      const combinedDeletedItems = [
        ...visionistas,
        ...news,
        ...galleries,
        ...partners
      ]

      const data = combinedDeletedItems.map((item) => ({
        id: item.id,
        sourceKey: item.type,
        type: item.type,
        displayTitle: item.vis_fullname || item.news_title || item.gal_title || item.par_fullname,
        deletedAt: normalizeDate(item.updatedAt),
        item,
      }))

      setDeletedItems(data)
    } catch (error) {
      console.error('Error fetching deleted items:', error)
    } finally {
      setLoading(false)
    }
  }

  const restoreMap = {
    visionista: recentlyDeletedApi.restoreDeletedVisionista,
    news: recentlyDeletedApi.restoreDeletedNews,
    gallery: recentlyDeletedApi.restoreDeletedGallery,
    partner: recentlyDeletedApi.restoreDeletedPartner,
  }

  const deleteMap = {
    visionista: recentlyDeletedApi.permanentDeleteVisionista,
    news: recentlyDeletedApi.permanentDeleteNews,
    gallery: recentlyDeletedApi.permanentDeleteGallery,
    partner: recentlyDeletedApi.permanentDeletePartner,
  }

  const normalizeDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-CA')
  }

  const columns = [
    { key: 'displayTitle', label: 'Name/Title' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span className="admin-deleted-type-tag">{formatType(val)}</span>,
    },
    { key: 'deletedAt', label: 'Deleted Date' },
  ]

  // Memoized filtered items for active filter tab
  const filteredItems = useMemo(() => {
    return deletedItems.filter((item) => matchesFilter(item, activeFilter))
  }, [deletedItems, activeFilter])

  // Memoized filter counts across all subtab categories
  const filterCounts = useMemo(() => {
    return deletedItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})
  }, [deletedItems])

  const getFilterCount = useCallback((filterKey) => filterCounts[filterKey] || 0, [filterCounts])

  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handleRestore = (item) => {
    setRestoreTarget(item)
  }

  const confirmRestore = async () => {
    if (!restoreTarget) return

    const targetToRestore = restoreTarget
    setRestoreTarget(null)

    // Optimistic UI update: remove restored item immediately
    setDeletedItems((prev) =>
      prev.filter((item) => !(item.id === targetToRestore.id && item.type === targetToRestore.type))
    )

    try {
      const fn = restoreMap[targetToRestore.type]
      if (fn) {
        await fn(targetToRestore.id, { isTemporarilyDeleted: false })
        showToast(`Restored "${targetToRestore.displayTitle}" successfully.`, 'success')
      }
    } catch (error) {
      console.error('Error restoring item:', error)
      showToast(extractErrorMessage(error, 'Failed to restore item.'), 'error')
      // Revert optimistic update on failure
      fetchData()
    }
  }

  const handleDeletePermanent = (item) => {
    setDeleteTarget(item)
  }

  const confirmPermanentDelete = async () => {
    if (!deleteTarget) return

    const targetToDelete = deleteTarget
    setDeleteTarget(null)

    // Optimistic UI update: remove deleted item immediately
    setDeletedItems((prev) =>
      prev.filter((item) => !(item.id === targetToDelete.id && item.type === targetToDelete.type))
    )

    try {
      const fn = deleteMap[targetToDelete.type]
      if (fn) {
        await fn(targetToDelete.id)
        showToast(`Permanently deleted "${targetToDelete.displayTitle}".`, 'info')
      }
    } catch (error) {
      console.error('Error permanently deleting item:', error)
      showToast(extractErrorMessage(error, 'Failed to permanently delete item.'), 'error')
      // Revert optimistic update on failure
      fetchData()
    }
  }

  return (
    <div className="admin-section active">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-deleted-header">
        <h2>Recently Deleted</h2>
        <p>Restore accidentally deleted records or permanently delete them.</p>
      </div>

      <div className="admin-subtabs" role="tablist" aria-label="Recently deleted categories">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter.key}
            className={`admin-subtab ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
            <span className="admin-subtab-count" title={`${getFilterCount(filter.key)} deleted items`}>{getFilterCount(filter.key)}</span>
          </button>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredItems}
        onRestore={handleRestore}
        onDelete={handleDeletePermanent}
        isLoading={loading}
        emptyMessage="No deleted records in this section."
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete item permanently?"
        itemName={deleteTarget?.displayTitle}
        confirmLabel="Delete Permanently"
        onConfirm={confirmPermanentDelete}
      >
        <p>
          This will permanently delete <strong>{deleteTarget?.displayTitle}</strong>. This action cannot be undone.
        </p>
      </AdminConfirmModal>

      <AdminConfirmModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title="Restore item?"
        itemName={restoreTarget?.displayTitle}
        action="restore"
        confirmLabel="Restore"
        onConfirm={confirmRestore}
      >
        <p>
          This will restore <strong>{restoreTarget?.displayTitle}</strong> and make it available again.
        </p>
      </AdminConfirmModal>
    </div>
  )
}

export default AdminDeleted
