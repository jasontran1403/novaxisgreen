import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';
import { createTempReflink } from '../services/reflinkService';
import { ChevronLeft, X } from 'lucide-react';

// Toast Component (giữ nguyên)
const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}
        backdrop-blur-sm border border-emerald-400/50 min-w-[250px] max-w-[400px]
      `}>
        {type === 'success' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

function BinaryTreeViewInner({ treeData: originalTreeData = null, onLoadFullTree = null }) {
  const [copiedRef, setCopiedRef] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTreeData, setSearchTreeData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  // ── States for node click & change root ──
  const [currentRoot, setCurrentRoot] = useState(originalTreeData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDetail, setNodeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { setViewport, fitView } = useReactFlow();

  // Hide watermark
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.react-flow__attribution { display: none !important; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  const copyRefLink = async (parentId, parentCode, position) => {
    if (!parentId || !parentCode) {
      showToast('Cannot create link: missing info', 'error');
      return;
    }

    const nodeKey = `${parentCode}-${position}`;

    try {
      setCopiedRef(`${nodeKey}-loading`);
      const data = await createTempReflink(parentId, position);
      const baseUrl = window.location.origin;
      const refLink = `${baseUrl}/register?ref=${data.refCode}`;

      await navigator.clipboard.writeText(refLink);
      setCopiedRef(nodeKey);
      setTimeout(() => setCopiedRef(null), 3000);

      const msg = data.isDefault
        ? `Copied default ${position} reflink!`
        : `Copied temp reflink (${data.refCode})`;
      showToast(msg, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create referral link', 'error');
      setCopiedRef(null);
    }
  };

  // Fetch user detail (fallback to node data if no separate endpoint)
  const fetchUserDetail = async (userId) => {
    if (!userId) {
      setDetailError('No user ID provided');
      setDetailLoading(false);
      return;
    }

    setDetailLoading(true);
    setDetailError('');
    setNodeDetail(null);

    try {
      const res = await api.get(API_ENDPOINTS.USER.BINARY_TREE_DETAIL, {
        params: { userId },
      });

      if (res) {
        console.log("Res ", res);
        setNodeDetail(res);
        console.log("Node Detail ", res);
      }
    } catch (err) {
      setNodeDetail(selectedNode);
      setDetailError('Could not load full details, showing basic info');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNodeClick = (nodeData) => {
    if (!nodeData?.userId && !nodeData?.memberCode) return;
    setSelectedNode(nodeData);
    fetchUserDetail(nodeData.userId, nodeData.memberCode || nodeData.username);
  };

  const goToThisNode = () => {
    if (!selectedNode?.memberCode && !selectedNode?.username) return;

    const targetUsername = selectedNode.memberCode || selectedNode.username;

    setSearchTerm('');
    setSearchTreeData(null);
    setCurrentRoot(null);
    setDetailLoading(true);

    api
      .get(API_ENDPOINTS.USER.BINARY_TREE, {
        params: { username: targetUsername },
      })
      .then((res) => {
        if (res.success && res.data?.root) {
          setCurrentRoot(res.data.root);
          showToast(`Switched to tree of ${targetUsername}`, 'success');
        } else {
          showToast(res.message || 'Failed to load new tree', 'error');
        }
      })
      .catch((err) => {
        showToast('Error switching tree', 'error');
        console.error(err);
      })
      .finally(() => {
        setDetailLoading(false);
        setSelectedNode(null);
      });
  };

  const goBackToOriginalRoot = () => {
    setCurrentRoot(originalTreeData);
    setSearchTerm('');
    setSearchTreeData(null);
    showToast('Returned to original root', 'success');
    setSelectedNode(null);
  };

  const MemberNode = ({ data }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return (
      <div
        className={`
          ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 flex items-center justify-center
          ${data.isCurrentUser
            ? 'border-emerald-400 bg-emerald-500/20'
            : 'border-emerald-500/50 bg-slate-600/50'
          }
          hover:border-emerald-400 transition-all cursor-pointer
        `}
        onClick={() => handleNodeClick(data)}
      >
        <Handle type="target" position={Position.Top} className="w-1 h-1 bg-emerald-500/50" />
        <div className="text-center px-1">
          <div className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} font-semibold text-emerald-300 leading-tight`}>
            {data.memberCode || 'N/A'}
          </div>
          <div className={`${isMobile ? 'text-[7px]' : 'text-[8px]'} text-emerald-300/70 mt-0.5 truncate ${isMobile ? 'max-w-[50px]' : 'max-w-[60px]'}`}>
            {data.sponsorName || 'N/A'}
          </div>
          {data.isCurrentUser && (
            <div className={`${isMobile ? 'text-[7px]' : 'text-[8px]'} text-emerald-400 font-medium mt-0.5`}>
              (You)
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} className="w-1 h-1 bg-emerald-500/50" />
      </div>
    );
  };

  const EmptyNode = ({ data }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const parentId = data?.parentId;
    const parentCode = data?.parentCode || '';
    const position = data?.position || 'left';
    const nodeKey = `${parentCode}-${position}`;

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (parentId && parentCode.trim()) {
        copyRefLink(parentId, parentCode, position);
      } else {
        showToast('Cannot create link. Try refreshing.', 'error');
      }
    };

    const isLoading = copiedRef === `${nodeKey}-loading`;
    const isCopied = copiedRef === nodeKey;

    return (
      <div className="flex flex-col items-center">
        <button
          onClick={handleClick}
          disabled={isLoading || !parentId}
          className={`
            relative ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 border-dashed 
            ${isLoading ? 'border-yellow-400 bg-yellow-500/10' :
              isCopied ? 'border-emerald-400 bg-emerald-500/20' :
                'border-emerald-500/30 bg-slate-600/20 hover:border-emerald-400'}
            transition-all cursor-pointer group ${!parentId ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={isLoading ? 'Creating...' : isCopied ? 'Copied!' : parentId ? `Get ${position} link` : 'No parent'}
        >
          <Handle type="target" position={Position.Top} className="w-1 h-1 bg-emerald-500/50" />
          <div className="flex flex-col items-center justify-center h-full">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mx-auto"></div>
            ) : isCopied ? (
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-emerald-400/50 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className="w-1 h-1 bg-emerald-500/50" />
        </button>
        <div className="text-[10px] text-emerald-300/40 italic mt-1">Empty</div>
      </div>
    );
  };

  const nodeTypes = useMemo(() => ({
    member: MemberNode,
    empty: EmptyNode,
  }), [copiedRef]);

  const calculateTreeLayout = (root) => {
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const VERTICAL_SPACING = isMobile ? 120 : 160;

    const getHorizontalSpacing = (level) => {
      const baseSpacing = isMobile ? 320 : 400;
      return baseSpacing * Math.pow(0.8, level);
    };

    const traverse = (node, parentId = null, position = null, parentInfo = null, level = 0, parentX = 0) => {
      if (!node && !parentId) return null;

      const id = node ? `node-${nodeId++}` : `empty-${nodeId++}`;
      const yPos = level * VERTICAL_SPACING;

      let xPos = parentX;
      if (level > 0) {
        const spacing = getHorizontalSpacing(level - 1);
        xPos = position === 'left' ? parentX - spacing : parentX + spacing;
      }

      if (node) {
        nodes.push({
          id,
          type: 'member',
          position: { x: xPos, y: yPos },
          data: {
            userId: node.id,
            memberCode: node.username,
            username: node.username,
            name: node.fullName,
            sponsorName: node.sponsorName,
            isCurrentUser: node.isCurrentUser,
          },
        });

        const currentParentInfo = { id: node.id, username: node.username };

        traverse(node.leftChild, id, 'left', currentParentInfo, level + 1, xPos);
        traverse(node.rightChild, id, 'right', currentParentInfo, level + 1, xPos);
      } else {
        nodes.push({
          id,
          type: 'empty',
          position: { x: xPos, y: yPos },
          data: {
            parentId: parentInfo?.id || null,
            parentCode: parentInfo?.username || '',
            position: position || 'left',
          },
        });
      }

      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
          style: { stroke: '#10b981', strokeWidth: 2 },
          animated: false,
        });
      }

      return id;
    };

    traverse(root, null, null, null, 0, 0);

    return { nodes, edges };
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setSearchTreeData(null);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');

      try {
        abortControllerRef.current = new AbortController();

        const res = await api.get(API_ENDPOINTS.USER.BINARY_TREE, {
          params: { username: trimmed },
          signal: abortControllerRef.current.signal,
        });

        if (res.success && res.data?.root) {
          setSearchTreeData(res.data.root);
          setSearchError("");
          showToast("Member found! ✓", "success");
          return;
        }
      } catch (err) {
        setSearchTreeData(null);

        if (err) {
          const message = err.message;
          console.log(err);

          if (message.toLowerCase().includes("not found")) {
            showToast("This member doesn't exist!", "error");
            setSearchError("This member doesn't exist!");
          } else {
            showToast(
              message || "Error occurred, please try again",
              "error"
            );
            setSearchError("Error searching member");
          }
        }
      } finally {
        setSearchLoading(false);
      }
    }, 1200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchTerm]);

  const displayTreeData = useMemo(() => {
    if (searchTerm.trim() && searchTreeData) return searchTreeData;
    return currentRoot || originalTreeData;
  }, [searchTerm, searchTreeData, currentRoot, originalTreeData]);

  const initialNodesAndEdges = useMemo(() => {
    if (!displayTreeData) return { nodes: [], edges: [] };
    return calculateTreeLayout(displayTreeData);
  }, [displayTreeData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges);
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    setNodes(initialNodesAndEdges.nodes);
    setEdges(initialNodesAndEdges.edges);
    if (reactFlowInstance.current) {
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.1, duration: 300 });
        setTimeout(() => {
          const currentZoom = reactFlowInstance.current.getZoom();
          reactFlowInstance.current.zoomTo(currentZoom * 1.1, { duration: 200 });
        }, 350);
      }, 100);
    }
  }, [initialNodesAndEdges, setNodes, setEdges]);

  const onInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.1, duration: 300 });
      setTimeout(() => {
        const currentZoom = instance.getZoom();
        instance.zoomTo(currentZoom * 1.1, { duration: 200 });
      }, 350);
    }, 100);
  }, []);

  return (
    <>
      <Toast {...toast} onClose={hideToast} />

      {/* Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-slate-900 border border-emerald-600/40 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-900 border-b border-emerald-800/50 p-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-emerald-400">
                {nodeDetail && nodeDetail.username}
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-emerald-400 hover:text-emerald-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {detailLoading ? (
                <div className="flex flex-col items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500 border-opacity-50"></div>
                  <p className="mt-6 text-emerald-300">Loading member info...</p>
                </div>
              ) : detailError ? (
                <div className="text-red-400 text-center py-8 font-medium">{detailError}</div>
              ) : nodeDetail ? (
                <div className="grid grid-cols-1 gap-4 text-gray-200 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">User Rank:</span>
                    <span>{nodeDetail.user_rank || "MEMBER"}</span>           {/* ← sửa userRank → user_rank */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">Leader Rank:</span>
                    <span>{nodeDetail.user_leader_rank || "VIP 0"}</span>     {/* ← userLeaderRank → user_leader_rank */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">Personal Sales:</span>
                    <span>{nodeDetail.personal_sales?.toLocaleString() || 0} USD</span>   {/* ← personalSales → personal_sales */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">Left Team Sales:</span>
                    <span>{nodeDetail.team_sales_left?.toLocaleString() || 0} USD</span>  {/* ← teamSalesLeft → team_sales_left */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">Right Team Sales:</span>
                    <span>{nodeDetail.team_sales_right?.toLocaleString() || 0} USD</span> {/* ← teamSalesRight → team_sales_right */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">Total Direct Sales:</span>
                    <span>{nodeDetail.total_direct_sales?.toLocaleString() || 0} USD</span> {/* ← totalDirectSales → total_direct_sales */}
                  </div>
                </div>
              ) : (
                <div className="text-yellow-300 text-center py-8">No detailed information available</div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-emerald-800/50 p-5 flex gap-4">
              <button
                onClick={() => setSelectedNode(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
              >
                Close
              </button>

              {selectedNode?.username &&
                selectedNode.username !== (currentRoot?.username || originalTreeData?.username) && (
                  <button
                    onClick={goToThisNode}
                    disabled={detailLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {detailLoading ? 'Switching...' : 'View this member\'s tree'}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-emerald-400">Binary Tree</h2>

            {currentRoot?.username !== originalTreeData?.username && (
              <button
                onClick={goBackToOriginalRoot}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-emerald-600/40 transition-all text-sm font-medium"
              >
                <ChevronLeft size={18} />
                Back to Root ({originalTreeData?.username || 'Root'})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member..."
              className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-emerald-500/50 rounded-lg text-white placeholder-emerald-400/60 focus:outline-none focus:border-emerald-400"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tree Area */}
        {searchLoading && (
          <div className="h-[500px] md:h-[700px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="mt-4 text-emerald-300">Searching...</p>
            </div>
          </div>
        )}

        {!searchLoading && searchTerm.trim() && !displayTreeData && (
          <div className="h-[500px] md:h-[700px] flex items-center justify-center">
            <div className="text-center text-yellow-300">
              {searchError || `No results for "${searchTerm}"`}
            </div>
          </div>
        )}

        {!searchLoading && !displayTreeData && !searchTerm.trim() && (
          <div className="h-[500px] md:h-[700px] flex items-center justify-center">
            <div className="text-center text-emerald-300/80">
              No binary tree data available
            </div>
          </div>
        )}

        {displayTreeData && (
          <div className="h-[500px] md:h-[700px] w-full rounded-lg overflow-hidden bg-slate-900/50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={onInit}
              fitView
              minZoom={0.4}
              maxZoom={1}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnScroll={true}
              panOnDrag={true}
              preventScrolling={true}
              nodesDraggable={false}
              style={{ background: 'transparent' }}
              defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } }}
            >
              <Background color="#10b981" gap={16} opacity={0.1} />
              <Controls showZoom={true} showFitView={true} showInteractive={false} />
            </ReactFlow>
          </div>
        )}
      </div>
    </>
  );
}

function BinaryTreeView({ treeData = null, onLoadFullTree = null }) {
  return (
    <ReactFlowProvider>
      <BinaryTreeViewInner treeData={treeData} onLoadFullTree={onLoadFullTree} />
    </ReactFlowProvider>
  );
}

export default BinaryTreeView;