function AdminDataTable({ columns, data, onEdit, onDelete, onRestore }) {
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
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(item[col.key], item) : (item[col.key] || 'N/A')}
                </td>
              ))}
              <td>
                <div className="admin-actions">
                  {onRestore ? (
                    <button 
                      onClick={() => onRestore(item)}
                      className="btn-restore"
                    >
                      Restore
                    </button>
                  ) : (
                    <button 
                      onClick={() => onEdit(item)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(item.id || index)}
                    className="btn-delete"
                  >
                    {onRestore ? 'Delete Permanently' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default AdminDataTable
