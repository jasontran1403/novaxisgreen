function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'OK', cancelText = 'Huỷ' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-emerald-500/50 dark:border-emerald-400/50 p-6 max-w-md w-full mx-4 shadow-xl glow-border">
        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-2">
            <svg 
              className="w-6 h-6 text-emerald-500 dark:text-emerald-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title || 'Xác nhận'}
          </h3>
        </div>

        {/* Modal Content */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-gray-900 rounded-lg transition-all shadow-lg shadow-emerald-500/50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

