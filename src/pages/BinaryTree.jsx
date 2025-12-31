import { useEffect, useState } from 'react';
import BinaryTreeMemberList from '../components/BinaryTreeMemberList';
import BinaryTreeView from '../components/BinaryTreeView';
import { useBinaryTree } from '../contexts/BinaryTreeContext';

function BinaryTree() {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'tree'
  const [hasLoadedTree, setHasLoadedTree] = useState(false); // Track if tree was loaded
  const { treeData, loading, error, fetchTreeData } = useBinaryTree();

  // ✅ Chỉ fetch Binary Tree khi chuyển sang tab 'tree' lần đầu tiên
  useEffect(() => {
    if (viewMode === 'tree' && !hasLoadedTree && !treeData) {
      console.log('[BINARY_TREE] Loading tree for first time...');
      fetchTreeData(15); // Load with depth 15
      setHasLoadedTree(true);
    }
  }, [viewMode, hasLoadedTree, treeData, fetchTreeData]);

  // Handler để load full tree
  const handleLoadFullTree = async (maxDepth = 5) => {
    await fetchTreeData(maxDepth);
  };

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* View Mode Toggle */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-2 md:p-4 glow-border glow-border-hover">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-2 hidden md:flex">
                <svg
                  className="w-6 h-6 text-emerald-400 dark:text-emerald-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* Binary Tree Icon */}
                  <circle cx="12" cy="4" r="2" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6L6 10M12 6L18 10" fill="none" />
                  <circle cx="6" cy="12" r="2" fill="currentColor" />
                  <circle cx="18" cy="12" r="2" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14L4 18M6 14L8 18M18 14L16 18M18 14L20 18" fill="none" />
                  <circle cx="4" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="20" cy="20" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 hidden md:block">
                View Mode
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
              <button
                onClick={() => setViewMode('table')}
                className={`
                  px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 md:flex-initial
                  ${viewMode === 'table'
                    ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-gray-900'
                    : 'bg-slate-600/50 text-emerald-300/80 dark:bg-gray-700/50 dark:text-emerald-400/80 hover:bg-slate-600 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-1 md:gap-2">
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="hidden sm:inline">Member List</span>
                  <span className="sm:hidden">List</span>
                </div>
              </button>

              <button
                onClick={() => setViewMode('tree')}
                className={`
                  px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 md:flex-initial
                  ${viewMode === 'tree'
                    ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-gray-900'
                    : 'bg-slate-600/50 text-emerald-300/80 dark:bg-gray-700/50 dark:text-emerald-400/80 hover:bg-slate-600 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-1 md:gap-2">
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {/* Binary Tree Icon */}
                    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5L7 8M12 4.5L17 8" fill="none" />
                    <circle cx="7" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="10" r="1.5" fill="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5L5.5 15M7 11.5L8.5 15M17 11.5L15.5 15M17 11.5L18.5 15" fill="none" />
                    <circle cx="5.5" cy="17" r="1" fill="currentColor" />
                    <circle cx="8.5" cy="17" r="1" fill="currentColor" />
                    <circle cx="15.5" cy="17" r="1" fill="currentColor" />
                    <circle cx="18.5" cy="17" r="1" fill="currentColor" />
                  </svg>
                  <span className="hidden sm:inline">Binary Tree</span>
                  <span className="sm:hidden">Tree</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
          // ✅ Tab Member List - tự fetch trong component
          <BinaryTreeMemberList />
        ) : (
          // ✅ Tab Binary Tree - chỉ hiển thị khi viewMode === 'tree'
          <>
            {loading ? (
              <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-8 glow-border">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
                  <p className="mt-4 text-emerald-300/80 dark:text-emerald-400/80">Loading binary tree...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-red-500/50 dark:border-red-400/50 p-8 glow-border">
                <div className="text-center">
                  <p className="text-red-400 dark:text-red-300">{error}</p>
                </div>
              </div>
            ) : (
              <BinaryTreeView treeData={treeData} onLoadFullTree={handleLoadFullTree} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BinaryTree;