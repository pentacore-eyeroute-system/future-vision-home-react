import './AdminDataTable.css'

function AdminDataTable({ columns, data, onEdit, onDelete, onRestore, isLoading = false, emptyMessage = 'No records found.' }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, rowIdx) => (
            <tr key={`skeleton-row-${rowIdx}`} className="admin-table-skeleton-row">
              {columns.map((col, colIdx) => (
                <td key={`skeleton-cell-${colIdx}`}>
                  <div
                    className={`skeleton-box h-4 rounded ${['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-4/5', 'w-3/5'][(colIdx + rowIdx) % 6]}`}
                  />
                </td>
              ))}
              <td>
                <div className="admin-actions justify-end gap-2">
                  <div className="skeleton-box h-7 w-14 rounded-md" />
                  <div className="skeleton-box h-7 w-16 rounded-md" />
                </div>
              </td>
            </tr>
          ))
        ) : data.length > 0 ? (
          data.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(item[col.key], item) : (item[col.key] ?? 'N/A')}
                </td>
              ))}
              <td>
                <div className="admin-actions">
                  {onRestore ? (
                    <button 
                      type="button"
                      onClick={() => onRestore(item)}
                      className="btn-restore"
                      aria-label={`Restore ${item.name || item.title || item.username || item.vis_fullname || item.news_title || item.par_fullname || item.gal_title || 'record'}`}
                    >
                      Restore
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => onEdit(item)}
                      className="btn-edit"
                      aria-label={`Edit ${item.name || item.title || item.username || item.vis_fullname || item.news_title || item.par_fullname || item.gal_title || 'record'}`}
                    >
                      Edit
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => onDelete(item)}
                    className="btn-delete"
                    aria-label={`${onRestore ? 'Permanently delete' : 'Delete'} ${item.name || item.title || item.username || item.vis_fullname || item.news_title || item.par_fullname || item.gal_title || 'record'}`}
                  >
                    {onRestore ? 'Delete Permanently' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1} className="admin-table-status-cell">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default AdminDataTable
