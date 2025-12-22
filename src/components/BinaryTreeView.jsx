import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';
import { createTempReflink } from '../services/reflinkService';

// Toast Component
const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        animation: isVisible ? 'slideIn 0.3s ease-out' : 'none'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        ${type === 'success'
          ? 'bg-emerald-500/90 dark:bg-emerald-600/90 text-white'
          : 'bg-red-500/90 dark:bg-red-600/90 text-white'
        }
        backdrop-blur-sm border border-emerald-400/50 dark:border-emerald-300/50
        min-w-[250px] max-w-[400px]
      `}>
        {type === 'success' ? (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Inner component that uses React Flow hooks
function BinaryTreeViewInner({ treeData: originalTreeData = null, onLoadFullTree = null }) {
  const [copiedRef, setCopiedRef] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTreeData, setSearchTreeData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });
  const [isLoadingFullTree, setIsLoadingFullTree] = useState(false);

  // Hide React Flow watermark
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .react-flow__attribution {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ========================================
  // ✅ UPDATED: copyRefLink with API call
  // ========================================
  const copyRefLink = async (parentId, parentCode, position) => {
    if (!parentId || !parentCode) {
      console.warn('Cannot copy: parentId or parentCode is missing');
      showToast('Cannot create link: missing info', 'error');
      return;
    }

    const nodeKey = `${parentCode}-${position}`;

    try {
      // Show loading state
      setCopiedRef(`${nodeKey}-loading`);
      
      // Call API to create/get reflink
      const data = await createTempReflink(parentId, position);
      
      // Build full URL with refCode from API
      const baseUrl = window.location.origin;
      const refLink = `${baseUrl}/register?ref=${data.refCode}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(refLink);
      
      // Show success
      setCopiedRef(nodeKey);
      setTimeout(() => setCopiedRef(null), 3000);
      
      // Show toast with appropriate message
      const msg = data.isDefault 
        ? `Copied default ${position} reflink!`
        : `Copied temp reflink (${data.refCode})`;
      showToast(msg, 'success');
      
      console.log(`[REFLINK] Created and copied: ${refLink}`);
    } catch (err) {
      console.error('[REFLINK] Failed to copy:', err);
      
      // Show error toast
      showToast(err.message || 'Failed to create referral link', 'error');
      setCopiedRef(null);
    }
  };

  // Custom Node Component cho node thường
  const MemberNode = ({ data }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return (
      <div className={`
        ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 flex items-center justify-center
        ${data.isCurrentUser
          ? 'border-emerald-400 dark:border-emerald-300 bg-emerald-500/20 dark:bg-emerald-400/20'
          : 'border-emerald-500/50 dark:border-emerald-400/50 bg-slate-600/50 dark:bg-gray-700/50'
        }
        hover:border-emerald-400 dark:hover:border-emerald-300 transition-all
      `}>
        <Handle type="target" position={Position.Top} className="w-1 h-1 bg-emerald-500/50" />
        <div className="text-center px-1">
          <div className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} font-semibold text-emerald-300 dark:text-emerald-400 leading-tight`}>
            {data.memberCode || 'N/A'}
          </div>
          <div className={`${isMobile ? 'text-[7px]' : 'text-[8px]'} text-emerald-300/70 dark:text-emerald-400/70 leading-tight mt-0.5 truncate ${isMobile ? 'max-w-[50px]' : 'max-w-[60px]'}`}>
            {data.sponsorName || 'N/A'}
          </div>
          {data.isCurrentUser && (
            <div className={`${isMobile ? 'text-[7px]' : 'text-[8px]'} text-emerald-400 dark:text-emerald-300 font-medium mt-0.5`}>
              (You)
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} className="w-1 h-1 bg-emerald-500/50" />
      </div>
    );
  };

  // ========================================
  // ✅ UPDATED: EmptyNode with API call
  // ========================================
  const EmptyNode = ({ data }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Extract data
    const parentId = data?.parentId;
    const parentCode = data?.parentCode || data?.parent?.memberCode || '';
    const position = data?.position || 'left';
    const nodeKey = `${parentCode}-${position}`;

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('[EMPTY_NODE] Clicked:', { parentId, parentCode, position, data, nodeKey });

      if (parentId && parentCode && parentCode.trim()) {
        copyRefLink(parentId, parentCode, position); // ← Pass parentId
      } else {
        console.warn('[EMPTY_NODE] Missing parentId or parentCode, data:', data);
        showToast('Cannot create link. Try refreshing.', 'error');
      }
    };

    const handleMouseDown = (e) => {
      e.stopPropagation();
    };

    const isLoading = copiedRef === `${nodeKey}-loading`;
    const isCopied = copiedRef === nodeKey;

    return (
      <div className="flex flex-col items-center">
        <button
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          type="button"
          disabled={isLoading || !parentId}
          className={`
            relative ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 border-dashed 
            ${isLoading 
              ? 'border-yellow-400/50 bg-yellow-500/10 cursor-wait'
              : isCopied
              ? 'border-emerald-400 dark:border-emerald-300 bg-emerald-500/20'
              : 'border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/20 dark:bg-gray-700/20'
            }
            ${!isLoading && !isCopied && 'hover:border-emerald-400 dark:hover:border-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10'}
            transition-all cursor-pointer group
            ${!parentId ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={
            isLoading 
              ? 'Creating referral link...'
              : isCopied
              ? 'Link copied!'
              : parentId 
              ? `Click to copy referral link for ${position} position (${parentCode})`
              : 'No parent info available'
          }
        >
          <Handle type="target" position={Position.Top} className="w-1 h-1 bg-emerald-500/50" />
          <div className="flex flex-col items-center justify-center h-full">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                <span className={`${isMobile ? 'text-[7px]' : 'text-[8px]'} text-yellow-400 mt-1`}>
                  Loading...
                </span>
              </>
            ) : isCopied ? (
              <>
                <svg
                  className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-emerald-400 dark:text-emerald-300`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className={`${isMobile ? 'text-[7px]' : 'text-[8px]'} text-emerald-400 dark:text-emerald-300 mt-1 font-medium`}>
                  Copied!
                </span>
              </>
            ) : (
              <>
                <svg
                  className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-emerald-400/50 dark:text-emerald-400/50 group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className="w-1 h-1 bg-emerald-500/50" />
        </button>
        <div className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} text-emerald-300/40 dark:text-emerald-400/40 italic mt-1`}>
          Empty
        </div>
      </div>
    );
  };

  const nodeTypes = useMemo(() => ({
    member: MemberNode,
    empty: EmptyNode,
  }), [copiedRef]); // ← Add copiedRef dependency

  // ========================================
  // ✅ UPDATED: calculateTreeLayout with userId and parentId
  // ========================================
  const calculateTreeLayout = (root) => {
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const HORIZONTAL_SPACING = isMobile ? 120 : 180;
    const VERTICAL_SPACING = isMobile ? 120 : 180;

    const getSubtreeWidth = (node) => {
      if (!node) return 1;
      const leftWidth = getSubtreeWidth(node.left);
      const rightWidth = getSubtreeWidth(node.right);
      return leftWidth + rightWidth;
    };

    const traverse = (node, parentId = null, position = null, parentInfo = null, level = 0, xOffset = 0) => {
      if (!node && !parentId) return;

      const id = node ? `node-${nodeId++}` : `empty-${nodeId++}`;
      const yPos = level * VERTICAL_SPACING;

      let xPos = xOffset;

      if (node) {
        const leftWidth = getSubtreeWidth(node.left);
        const rightWidth = getSubtreeWidth(node.right);

        if (leftWidth + rightWidth > 0) {
          xPos = xOffset;
        } else {
          xPos = xOffset;
        }
      } else {
        if (position === 'left') {
          xPos = xOffset - HORIZONTAL_SPACING;
        } else if (position === 'right') {
          xPos = xOffset + HORIZONTAL_SPACING;
        }
      }

      // ✅ Create node WITH userId for member nodes
      if (node) {
        nodes.push({
          id,
          type: 'member',
          position: { x: xPos, y: yPos },
          data: {
            userId: node.id,  // ← ADD THIS
            memberCode: node.memberCode,
            name: node.name,
            sponsorName: node.sponsorName,
            isCurrentUser: node.isCurrentUser,
          },
        });
      } else {
        // ✅ Create empty node WITH parentId
        if (!parentInfo || !parentInfo.id || !parentInfo.memberCode) {
          console.warn(`[TREE_LAYOUT] Empty node at level ${level}, position ${position} missing parentInfo. parentInfo:`, parentInfo);
        }
        nodes.push({
          id,
          type: 'empty',
          position: { x: xPos, y: yPos },
          data: {
            parentId: parentInfo?.id || null,  // ← ADD THIS
            parentCode: parentInfo?.memberCode || '',
            position: position || 'left',
          },
        });
      }

      // Create edge from parent
      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'straight',
          style: { stroke: '#10b981', strokeWidth: 2 },
          animated: false,
        });
      }

      // Process children
      if (node) {
        const leftWidth = getSubtreeWidth(node.left);
        const rightWidth = getSubtreeWidth(node.right);

        let leftXOffset = xPos;
        let rightXOffset = xPos;

        const leftSpan = leftWidth * HORIZONTAL_SPACING;
        const rightSpan = rightWidth * HORIZONTAL_SPACING;

        if (leftWidth > 0 && rightWidth > 0) {
          const gap = HORIZONTAL_SPACING;
          const totalHalfSpan = (leftSpan + rightSpan) / 2;
          leftXOffset = xPos - totalHalfSpan - gap;
          rightXOffset = xPos + totalHalfSpan + gap;
        } else if (leftWidth > 0) {
          leftXOffset = xPos - HORIZONTAL_SPACING;
          rightXOffset = xPos + HORIZONTAL_SPACING;
        } else if (rightWidth > 0) {
          leftXOffset = xPos - HORIZONTAL_SPACING;
          rightXOffset = xPos + HORIZONTAL_SPACING;
        } else {
          leftXOffset = xPos - HORIZONTAL_SPACING;
          rightXOffset = xPos + HORIZONTAL_SPACING;
        }

        if (leftXOffset >= xPos || rightXOffset <= xPos) {
          console.warn(`Invalid positioning: leftXOffset=${leftXOffset}, xPos=${xPos}, rightXOffset=${rightXOffset}`);
        }

        // ✅ Pass parent info WITH id to children
        const currentParentInfo = {
          id: node.id,  // ← ADD THIS
          memberCode: node.memberCode,
        };
        
        if (!currentParentInfo.id || !currentParentInfo.memberCode) {
          console.warn(`[TREE_LAYOUT] Node at level ${level} missing id or memberCode. Node data:`, node);
        }
        
        traverse(node.left || null, id, 'left', currentParentInfo, level + 1, leftXOffset);
        traverse(node.right || null, id, 'right', currentParentInfo, level + 1, rightXOffset);
      }

      return id;
    };

    if (root) {
      traverse(root, null, null, null, 0, 0);
    }

    return { nodes, edges };
  };

  // Search tree via API
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setSearchTreeData(null);
      setSearchError('');
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError('');
        const response = await api.get(API_ENDPOINTS.USER.SEARCH(searchTerm.trim()));

        if (response.success) {
          setSearchTreeData(response.data);
          if (!response.found) {
            setSearchError('No member found');
          }
        } else {
          setSearchError(response.error || 'Search failed');
          setSearchTreeData(null);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchError(error.message || 'Failed to search');
        setSearchTreeData(null);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // Get the tree to display (either original or searched result)
  const displayTreeData = useMemo(() => {
    if (searchTerm && searchTerm.trim()) {
      return searchTreeData;
    }
    return originalTreeData;
  }, [originalTreeData, searchTreeData, searchTerm]);

  // Calculate initial nodes and edges
  const initialNodesAndEdges = useMemo(() => {
    if (!displayTreeData) return { nodes: [], edges: [] };
    return calculateTreeLayout(displayTreeData);
  }, [displayTreeData]);

  // Use React Flow's state management for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges);
  const reactFlowInstance = useRef(null);

  // Update nodes and edges when tree data changes
  useEffect(() => {
    setNodes(initialNodesAndEdges.nodes);
    setEdges(initialNodesAndEdges.edges);

    if (reactFlowInstance.current) {
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.2, duration: 300, maxZoom: 1.5 });
      }, 100);
    }
  }, [initialNodesAndEdges, setNodes, setEdges]);

  // Callback when ReactFlow is initialized
  const onInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.2, duration: 300, maxZoom: 1.5 });
    }, 100);
  }, []);

  if (!originalTreeData && !searchTerm) {
    return (
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-8 glow-border glow-border-hover">
        <div className="text-center">
          <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-400 dark:text-emerald-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
          <p className="text-emerald-300/80 dark:text-emerald-400/80 text-sm">
            No binary tree data available
          </p>
        </div>
      </div>
    );
  }

  if (searchTerm && searchLoading) {
    return (
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-8 glow-border glow-border-hover">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-emerald-300/80 dark:text-emerald-400/80">Searching...</p>
        </div>
      </div>
    );
  }

  if (searchTerm && !displayTreeData && !searchLoading) {
    return (
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-8 glow-border glow-border-hover">
        <div className="text-center">
          <div className="bg-yellow-500/20 dark:bg-yellow-400/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-400 dark:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-yellow-300/80 dark:text-yellow-400/80 text-sm mb-2">
            {searchError || `No member found matching "${searchTerm}"`}
          </p>
          <p className="text-emerald-300/60 dark:text-emerald-400/60 text-xs">
            Try searching by member code or name
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-3 md:p-6 glow-border glow-border-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-1.5 md:p-2">
              <svg
                className="w-4 h-4 md:w-6 md:h-6 text-emerald-400 dark:text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            <h2 className="text-base md:text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
              Binary Tree
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {onLoadFullTree && (
              <button
                onClick={async () => {
                  setIsLoadingFullTree(true);
                  try {
                    await onLoadFullTree(50);
                    showToast('Loading full tree...', 'success');
                  } catch (err) {
                    showToast('Failed to load full tree', 'error');
                  } finally {
                    setIsLoadingFullTree(false);
                  }
                }}
                disabled={isLoadingFullTree || searchTerm}
                className={`
                inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg
                transition-all shadow-lg
                ${isLoadingFullTree || searchTerm
                    ? 'bg-slate-600/30 text-emerald-300/30 dark:bg-gray-700/30 dark:text-emerald-400/30 cursor-not-allowed'
                    : 'bg-emerald-500/20 text-emerald-300 dark:bg-emerald-400/20 dark:text-emerald-400 hover:bg-emerald-500/30 dark:hover:bg-emerald-400/30'
                  }
              `}
                title={searchTerm ? 'Clear search to load full tree' : 'Load full binary tree'}
              >
                {isLoadingFullTree ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-400"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Load Full Tree</span>
                  </>
                )}
              </button>
            )}

            <div className="relative w-full sm:w-auto min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-400/60 dark:text-emerald-300/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search member..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 placeholder-emerald-300/40 dark:placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400/60 dark:text-emerald-300/60 hover:text-emerald-400 dark:hover:text-emerald-300"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-[350px] sm:h-[400px] md:h-[600px] w-full rounded-lg overflow-hidden bg-slate-800/50 dark:bg-gray-900/50 touch-pan-x touch-pan-y">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            fitView={false}
            fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
            minZoom={0.1}
            maxZoom={3}
            panOnScroll={true}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            defaultEdgeOptions={{
              type: 'straight',
              style: { stroke: '#10b981', strokeWidth: 2 },
              animated: false,
            }}
            connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
            style={{ background: 'transparent' }}
          >
            <Background color="#10b981" gap={16} opacity={0.1} />
            <Controls
              showInteractive={false}
              style={{ button: { backgroundColor: '#1e293b', color: '#10b981', borderColor: '#10b981' } }}
            />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'empty') return '#64748b';
                return node.data?.isCurrentUser ? '#10b981' : '#475569';
              }}
              style={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
              maskColor="rgba(0, 0, 0, 0.5)"
              pannable={true}
              zoomable={true}
            />
          </ReactFlow>
        </div>

        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-emerald-500/30 dark:border-emerald-400/30">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-400 dark:border-emerald-300 bg-emerald-500/20 dark:bg-emerald-400/20"></div>
              <span className="text-emerald-300/80 dark:text-emerald-400/80">Current Member</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-500/50 dark:border-emerald-400/50 bg-slate-600/50 dark:bg-gray-700/50"></div>
              <span className="text-emerald-300/80 dark:text-emerald-400/80">Other Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-dashed border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/20 dark:bg-gray-700/20"></div>
              <span className="text-emerald-300/80 dark:text-emerald-400/80">Empty Position (Click to get link)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrapper component with ReactFlowProvider
function BinaryTreeView({ treeData = null, onLoadFullTree = null }) {
  return (
    <ReactFlowProvider>
      <BinaryTreeViewInner treeData={treeData} onLoadFullTree={onLoadFullTree} />
    </ReactFlowProvider>
  );
}

export default BinaryTreeView;