export default function PaginationBar({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', gap: '8px', marginTop: '32px'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 16px', borderRadius: '8px',
          border: '1px solid #ddd', fontWeight: 600,
          background: currentPage === 1 ? '#f5f5f5' : 'white',
          color: currentPage === 1 ? '#aaa' : '#333',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        ← Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1px solid', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', transition: 'all 0.2s',
            background: currentPage === page ? '#111827' : 'white',
            color: currentPage === page ? 'white' : '#333',
            borderColor: currentPage === page ? '#111827' : '#ddd',
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 16px', borderRadius: '8px',
          border: '1px solid #ddd', fontWeight: 600,
          background: currentPage === totalPages ? '#f5f5f5' : 'white',
          color: currentPage === totalPages ? '#aaa' : '#333',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next →
      </button>
    </div>
  );
}
