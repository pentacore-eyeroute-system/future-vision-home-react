import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import AdminDataTable from '../../components/admin/AdminDataTable'

const FILTERS = [
  { key: 'visionista', label: 'Visionistas' },
  { key: 'news-gallery', label: 'News & Gallery' },
  { key: 'partner', label: 'Partners' },
]

const matchesFilter = (item, filter) => {
  if (filter === 'all') return true
  if (filter === 'news-gallery') return item.type === 'news' || item.type === 'gallery'
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const data = await adminApi.getDeletedItems()
    setDeletedItems(data)
    setLoading(false)
  }

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
    await adminApi.restoreDeletedItem(item.id)
    fetchData()
  }

  const handleDeletePermanent = async (item) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      await adminApi.permanentlyDeleteItem(item.id)
      fetchData()
    }
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
    </div>
  )
}

export default AdminDeleted
