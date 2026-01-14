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

  const MemberNode = ({ data }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return (
      <div className={`
        ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 flex items-center justify-center
        ${data.isCurrentUser
          ? 'border-emerald-400 bg-emerald-500/20'
          : 'border-emerald-500/50 bg-slate-600/50'
        }
        hover:border-emerald-400 transition-all
      `}>
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
    
    // Khoảng cách ngang giữa parent và child ở mỗi level (giảm dần theo level)
    const getHorizontalSpacing = (level) => {
      const baseSpacing = isMobile ? 320 : 400; // Tăng thêm để tránh chồng khi cây đầy đủ
      // Giảm 20% mỗi level để các node dưới vẫn cách xa
      return baseSpacing * Math.pow(0.8, level);
    };

    const traverse = (node, parentId = null, position = null, parentInfo = null, level = 0, parentX = 0) => {
      if (!node && !parentId) return null;

      const id = node ? `node-${nodeId++}` : `empty-${nodeId++}`;
      const yPos = level * VERTICAL_SPACING;

      // Tính vị trí X: parent ở giữa, con trái/phải cách đều nhau
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
            name: node.fullName,
            sponsorName: node.sponsorName,
            isCurrentUser: node.isCurrentUser,
          },
        });

        const currentParentInfo = { id: node.id, username: node.username };

        // Đệ quy vẽ cây con trái và phải với spacing đều nhau
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
          signal: abortControllerRef.current.signal
        });

        if (res.success && res.data?.root) {
          setSearchTreeData(res.data.root);
          setSearchError('');
        } else {
          setSearchTreeData(null);
          setSearchError(res.message || 'Member not found');
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setSearchTreeData(null);
        setSearchError('Failed to search');
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
    return searchTerm.trim() && searchTreeData ? searchTreeData : originalTreeData;
  }, [searchTerm, searchTreeData, originalTreeData]);

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
        // Zoom thêm 10%
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
      // Zoom thêm 10%
      setTimeout(() => {
        const currentZoom = instance.getZoom();
        instance.zoomTo(currentZoom * 1.1, { duration: 200 });
      }, 350);
    }, 100);
  }, []);

  return (
    <>
      <Toast {...toast} onClose={hideToast} />

      <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-emerald-400">Binary Tree</h2>

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