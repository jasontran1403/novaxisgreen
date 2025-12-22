import { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';
import { useAuth } from './AuthContext';

const BinaryTreeContext = createContext(null);

export const useBinaryTree = () => {
  const context = useContext(BinaryTreeContext);
  if (!context) {
    throw new Error('useBinaryTree must be used within BinaryTreeProvider');
  }
  return context;
};

export const BinaryTreeProvider = ({ children }) => {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maxDepth, setMaxDepth] = useState(15);

  /**
   * Transform API response data to component-expected format
   * API format: { id, username, fullName, leftChild, rightChild, ... }
   * Component expects: { memberCode, name, left, right, ... }
   */
  const transformNodeData = (node) => {
    if (!node) return null;
    
    return {
      // Map API fields to component fields
      memberCode: node.username,           // username → memberCode
      name: node.fullName, // fullName → name
      sponsorName: node.sponsorName,
      id: node.id,
      
      // Copy other useful fields
      rank: node.rank,
      rankName: node.rankName,
      sales: node.sales,
      teamSales: node.teamSales,
      teamSalesLeft: node.teamSalesLeft,
      teamSalesRight: node.teamSalesRight,
      side: node.side,
      depth: node.depth,
      hasLeftChild: node.hasLeftChild,
      hasRightChild: node.hasRightChild,
      timeCreate: node.timeCreate,
      isLockAccount: node.isLockAccount,
      
      // Determine if this is current user
      isCurrentUser: user?.id === node.id,
      
      // Recursively transform children
      // leftChild/rightChild → left/right
      left: node.leftChild ? transformNodeData(node.leftChild) : null,
      right: node.rightChild ? transformNodeData(node.rightChild) : null,
    };
  };

  // Fetch binary tree data
  const fetchTreeData = async (customMaxDepth = null, userId = null) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      
      const depthToUse = customMaxDepth !== null ? customMaxDepth : maxDepth;
      
      // Build params
      const params = { maxDepth: depthToUse };
      if (userId) {
        params.userId = userId;
      }
      
      const response = await api.get(API_ENDPOINTS.USER.BINARY_TREE, {
        params
      });
      
      if (response.success && response.data) {
        // Transform root node
        const transformedRoot = transformNodeData(response.data.root);
        
        console.log('[FETCH_TREE] Transformed root:', transformedRoot);
        
        setTreeData(transformedRoot);
        setMaxDepth(depthToUse);
      } else {
        // Check if error due to size, retry with smaller depth
        if (response.error?.includes('quá lớn') || response.error?.includes('serialize')) {
          if (depthToUse > 3) {
            console.warn(`Tree too large with maxDepth=${depthToUse}, retrying with maxDepth=${depthToUse - 2}`);
            return fetchTreeData(depthToUse - 2, userId);
          }
        }
        setError(response.error || 'Không thể tải dữ liệu cây nhị phân');
      }
    } catch (err) {
      console.error('[FETCH_TREE] Error:', err);
      
      // Check if error due to size
      if (err.response?.status === 413 || err.message?.includes('serialize') || err.message?.includes('quá lớn')) {
        if (maxDepth > 3) {
          console.warn(`Tree too large with maxDepth=${maxDepth}, retrying with maxDepth=${maxDepth - 2}`);
          return fetchTreeData(maxDepth - 2, userId);
        }
      }
      setError(err.message || 'Lỗi khi tải dữ liệu cây nhị phân');
    } finally {
      setLoading(false);
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchTreeData();
    }
  }, [user?.id]);

  const value = {
    treeData,
    loading,
    error,
    maxDepth,
    setMaxDepth,
    fetchTreeData,
    refresh: fetchTreeData
  };

  return (
    <BinaryTreeContext.Provider value={value}>
      {children}
    </BinaryTreeContext.Provider>
  );
};