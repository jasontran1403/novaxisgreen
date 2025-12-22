import { useMemo } from 'react';

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  const pages = useMemo(() => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Hiển thị tất cả các trang nếu tổng số trang <= maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Logic hiển thị trang với ellipsis
      if (currentPage <= 3) {
        // Hiển thị 3 trang đầu + ... + trang cuối
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Hiển thị trang đầu + ... + 3 trang cuối
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Hiển thị trang đầu + ... + trang hiện tại + ... + trang cuối
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-emerald-500/30 dark:border-emerald-400/30">
      {/* Info */}
      <div className="text-xs text-emerald-300/70 dark:text-emerald-400/70">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            currentPage === 1
              ? 'bg-slate-600/30 text-emerald-300/30 dark:bg-gray-700/30 dark:text-emerald-400/30 cursor-not-allowed'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-400 dark:text-emerald-300 hover:text-emerald-300 dark:hover:text-emerald-200'
          }`}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-emerald-300/50 dark:text-emerald-400/50"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-gray-900'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-400 dark:text-emerald-300 hover:text-emerald-300 dark:hover:text-emerald-200'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            currentPage === totalPages
              ? 'bg-slate-600/30 text-emerald-300/30 dark:bg-gray-700/30 dark:text-emerald-400/30 cursor-not-allowed'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-400 dark:text-emerald-300 hover:text-emerald-300 dark:hover:text-emerald-200'
          }`}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;

