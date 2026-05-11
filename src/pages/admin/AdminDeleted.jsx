import { useState, useEffect } from 'react'
import AdminDataTable from '../../components/admin/AdminDataTable'

function AdminDeleted() {
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // Mock data for deleted items
    setDeletedItems([
      { id: 101, displayTitle: 'Old Partner', type: 'partner', deletedAt: '2025-05-01' },
      { id: 102, displayTitle: 'Draft News', type: 'news', deletedAt: '2025-05-05' },
    ])
    setLoading(false)
  }

  const columns = [
    { key: 'displayTitle', label: 'Name/Title' },
    { 
      key: 'type', 
      label: 'Type',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{val}</span>
    },
    { key: 'deletedAt', label: 'Deleted Date' },
  ]

  const handleRestore = (item) => {
    alert(`Restoring ${item.displayTitle}...`)
    // Logic to move back to active tables
  }

  const handleDeletePermanent = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      setDeletedItems(deletedItems.filter(item => item.id !== id))
    }
  }

  return (
    <div className="admin-section active">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Recently Deleted</h2>
        <p>Restore accidentally deleted records or permanently delete them.</p>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={deletedItems} 
        onRestore={handleRestore}
        onDelete={handleDeletePermanent} 
      />
    </div>
  )
}

export default AdminDeleted
