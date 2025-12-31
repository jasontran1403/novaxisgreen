import { createContext, useContext, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';

const BinaryTreeContext = createContext(null);

export const useBinaryTree = () => {
  const context = useContext(BinaryTreeContext);
  if (!context) {
    throw new Error('useBinaryTree must be used within BinaryTreeProvider');
  }
  return context;
};

export const BinaryTreeProvider = ({ children }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ false, không phải true
  const [error, setError] = useState('');
  const [maxDepth, setMaxDepth] = useState(5);

  // ✅ Fetch binary tree data - CHỈ gọi khi cần
  const fetchTreeData = async (customMaxDepth = null, userId = null) => {
    try {
      setLoading(true);
      setError('');
      
      const depthToUse = customMaxDepth !== null ? customMaxDepth : maxDepth;
      
      // Build params
      const params = {};
      if (userId) {
        params.userId = userId;
      }
      
      console.log('[BINARY_TREE_CONTEXT] Fetching tree with params:', params);
      
      const response = await api.get(API_ENDPOINTS.USER.BINARY_TREE, {
        params
      });
      
      if (response.success && response.data) {
        // ✅ Set data TRỰC TIẾP từ API - không transform
        // API trả về: { root: { id, username, fullName, leftChild, rightChild, ... } }
        setTreeData(response.data.root);
        setMaxDepth(depthToUse);
        console.log('[BINARY_TREE_CONTEXT] Tree loaded successfully');
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
      console.error('[BINARY_TREE_CONTEXT] Error:', err);
      
      // Check if error due to size
      if (err.response?.status === 413 || err.message?.includes('serialize') || err.message?.includes('quá lớn')) {
        const currentDepth = customMaxDepth !== null ? customMaxDepth : maxDepth;
        if (currentDepth > 3) {
          console.warn(`Tree too large with maxDepth=${currentDepth}, retrying with maxDepth=${currentDepth - 2}`);
          return fetchTreeData(currentDepth - 2, userId);
        }
      }
      setError(err.message || 'Lỗi khi tải dữ liệu cây nhị phân');
    } finally {
      setLoading(false);
    }
  };

  // ✅ KHÔNG có useEffect auto-fetch
  // Component sẽ tự gọi fetchTreeData() khi cần

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