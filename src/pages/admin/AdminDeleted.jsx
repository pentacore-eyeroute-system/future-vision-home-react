import { useState, useEffect } from 'react'
import { galleryApi } from '../../api/galleryApi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import { recentlyDeletedApi } from '../../api/recentlyDeletedApi'

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

    const visionistas = await recentlyDeletedApi.getDeletedVisionistas();
    const news = await recentlyDeletedApi.getDeletedNews();
    const galleries = await recentlyDeletedApi.getDeletedGalleries();
    const partners = await recentlyDeletedApi.getDeletedPartners();

    const combinedDeletedItems = [
      ...visionistas.result,
      ...news.result,
      ...galleries.result,
      ...partners.result
    ];

    const data = combinedDeletedItems.map((item) => ({
      id: item.id,
      sourceKey: item.type,
      type: item.type,
      displayTitle: item.vis_fullname || item.news_title || item.gal_title || item.par_fullname,
      deletedAt: normalizeDate(item.updatedAt),
      item,
    }));

    setDeletedItems(data)
    setLoading(false)
  }

  const normalizeDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA');
  };

  const columns = [
    { key: 'displayTitle', label: 'Name/Title' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{formatType(val)}</span>,
    },
    { key: 'deletedAt', label: 'Deleted Date' },
  ]

  const filteredItems = deletedItems.filter((item) => matchesFilter(item, activeFilter))

  const getFilterCount = (filterKey) => deletedItems.filter((item) => matchesFilter(item, filterKey)).length

  const handleRestore = async (item) => {
    setRestoreTarget(item)
  }

  const confirmRestore = async () => {
    if (!restoreTarget) return

    let isTemporarilyDeleted = !restoreTarget.item.gal_is_temporarily_deleted;
    
    await galleryApi.temporaryDeleteGallery(restoreTarget.id, { isTemporarilyDeleted: isTemporarilyDeleted});
    setRestoreTarget(null)
    fetchData()
  }

  const handleDeletePermanent = async (item) => {
    setDeleteTarget(item)
  }

  const confirmPermanentDelete = async () => {
    if (!deleteTarget) return

    await galleryApi.permanentDeleteGallery(deleteTarget.id);
    setDeleteTarget(null)
    fetchData()
  }

  return (
    <div className="admin-section active">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Recently Deleted</h2>
        <p>Restore accidentally deleted records or permanently delete them.</p>
      </div>

      <div className="admin-subtabs" role="tablist" aria-label="Recently deleted filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`admin-subtab ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
            <span className="admin-subtab-count">{getFilterCount(filter.key)}</span>
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
