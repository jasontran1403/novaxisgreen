import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function BinaryTreeMemberList() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showRefModal, setShowRefModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [leftRef, setLeftRef] = useState('');
  const [rightRef, setRightRef] = useState('');

  const buildRefLinks = () => {
    const baseUrl = window.location.origin;

    console.log({leftRef, rightRef});

    return {
      left: `${baseUrl}/register?ref=${leftRef}`,
      right: `${baseUrl}/register?ref=${rightRef}`
    };
  };

  const handleAddMember = () => {
    setCopyMessage('');
    setShowRefModal(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Link copied');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setCopyMessage('Cannot copy automatically, please copy manually');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  // Fetch F1 members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError('');
        
        console.log('[FETCH_MEMBERS] Fetching F1 members...');
        
        // Get F1 by sponsor của current user
        const response = await api.get(API_ENDPOINTS.USER.F1_MEMBERS);
        
        console.log('[FETCH_MEMBERS] Response:', response);
        
        if (response.success) {
          // Data đã đúng format từ backend, không cần map lại
          const data = response.data || [];
          
          console.log('[FETCH_MEMBERS] Loaded', data.length, 'members');
          setLeftRef(response.leftRef);
          setRightRef(response.rightRef);
          setMembers(data);
        } else {
          setError(response.error || 'Cannot load member list');
        }
      } catch (err) {
        console.error('[FETCH_MEMBERS] Error:', err);
        setError(err.message || 'Error loading member list');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user?.id]);

  // Toggle expand/collapse row
  const toggleExpand = async (memberId, level) => {
    const key = `${memberId}-${level}`;
    
    if (expandedRows.has(key)) {
      // Collapse
      setExpandedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    } else {
      // Expand
      setExpandedRows(prev => new Set(prev).add(key));
      
      // Fetch children if not loaded
      const member = findMemberById(members, memberId);
      if (member && !member.childrenFetched) {
        try {
          console.log('[EXPAND] Fetching F1 for member ID:', memberId);
          
          // Get F1 của member này
          const response = await api.get(API_ENDPOINTS.USER.F1_MEMBERS_BY_ID(memberId));
          
          console.log('[EXPAND] F1 response:', response);
          
          if (response.success) {
            // Data đã đúng format, không cần map
            const children = response.data || [];
            
            console.log('[EXPAND] Loaded', children.length, 'children');
            
            updateMemberWithChildren(memberId, children);
          } else {
            // No F1 found
            updateMemberWithChildren(memberId, []);
          }
        } catch (err) {
          console.error('[EXPAND] Error:', err);
          updateMemberWithChildren(memberId, []);
        }
      }
    }
  };

  // Helper function to find member by ID
  const findMemberById = (memberList, id) => {
    for (const member of memberList) {
      if (member.id === id) return member;
      if (member.children) {
        const found = findMemberById(member.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Update member with children
  const updateMemberWithChildren = (memberId, children) => {
    setMembers(prevMembers => {
      const updateMember = (list) => {
        return list.map(member => {
          if (member.id === memberId) {
            return { ...member, children, childrenFetched: true };
          }
          if (member.children) {
            return { ...member, children: updateMember(member.children) };
          }
          return member;
        });
      };
      return updateMember(prevMembers);
    });
  };

  // Render member row với recursive cho children
  const renderMemberRow = (member, index, level = 1, parentIndex = '') => {
    const rowIndex = parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`;
    const isExpanded = expandedRows.has(`${member.id}-${level}`);
    const uniqueKey = `${member.id}-${level}-${index}`;

    return (
      <>
        <tr
          key={uniqueKey}
          className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
        >
          {/* Stt */}
          <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {/* Expand button */}
              <button
                onClick={() => toggleExpand(member.id, level)}
                className="w-6 h-6 flex items-center justify-center rounded border-2 border-emerald-500/50 dark:border-emerald-400/50 hover:bg-emerald-500/20 dark:hover:bg-emerald-400/20 hover:border-emerald-400 dark:hover:border-emerald-300 transition-all"
                title={isExpanded ? 'Collapse' : 'Expand to view F1'}
              >
                {isExpanded ? (
                  <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
              <span className="font-medium">{rowIndex}</span>
            </div>
          </td>

          {/* User name */}
          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 font-medium whitespace-nowrap">
            <span>{member.username || member.name || 'N/A'}</span>
          </td>

          {/* Sponsor Node */}
          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
            <span className="px-2 py-1 rounded bg-slate-600/50 dark:bg-gray-700/50 text-emerald-300/80 dark:text-emerald-400/80">
              {member.sponsorNode || member.sponsorUsername || '-'}
            </span>
          </td>

          {/* Rank - VIP */}
          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
            {member.capVip ? (
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 font-medium">
                {member.capVip}
              </span>
            ) : (
              <span className="text-emerald-300/50 dark:text-emerald-400/50">-</span>
            )}
          </td>

          {/* Total Investment */}
          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap font-medium text-right">
            {formatCurrency(member.totalInvestment || 0, 'USDT')}
          </td>

          {/* Left Branch Sales */}
          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap text-right">
            {formatCurrency(member.leftBranchSales || member.teamSalesLeft || 0, 'USDT')}
          </td>

          {/* Right Branch Sales */}
          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap text-right">
            {formatCurrency(member.rightBranchSales || member.teamSalesRight || 0, 'USDT')}
          </td>
        </tr>

        {/* Render children if expanded */}
        {isExpanded && member.children && member.children.length > 0 && (
          <>
            {member.children.map((child, childIndex) => 
              renderMemberRow(child, childIndex, level + 1, rowIndex)
            )}
          </>
        )}
        
        {/* Show loading state */}
        {isExpanded && !member.childrenFetched && (
          <tr>
            <td colSpan={7} className="py-2 px-4 text-xs text-emerald-300/60 dark:text-emerald-400/60 italic">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-400"></div>
                Loading F1...
              </div>
            </td>
          </tr>
        )}
        
        {/* Show "No F1" message */}
        {isExpanded && member.children?.length === 0 && member.childrenFetched && (
          <tr>
            <td colSpan={7} className="py-2 px-4 text-xs text-emerald-300/60 dark:text-emerald-400/60 italic">
              No F1 members
            </td>
          </tr>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-8 glow-border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-emerald-300/80 dark:text-emerald-400/80">Loading member list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-red-500/50 dark:border-red-400/50 p-8 glow-border">
        <div className="text-center">
          <p className="text-red-400 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-2">
            <svg 
              className="w-6 h-6 text-emerald-400 dark:text-emerald-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
            F1 Members ({members.length})
          </h2>
        </div>
        
        <button
          onClick={handleAddMember}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-gray-900 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add member
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/30 dark:bg-gray-700/30">
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                No.
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Username
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Sponsor
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Rank
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Investment
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Left Sales
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Right Sales
              </th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-emerald-300/60 dark:text-emerald-400/60">
                  No F1 members yet
                </td>
              </tr>
            ) : (
              members.map((member, index) => renderMemberRow(member, index))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Reflink Modal */}
    {showRefModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-800 text-emerald-50 rounded-lg border border-emerald-400/70 p-5 w-full max-w-lg mx-4 shadow-[0_0_32px_rgba(16,185,129,0.35)] glow-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Add member via referral link</h3>
            <button
              onClick={() => setShowRefModal(false)}
              className="text-emerald-200 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-emerald-100/80 mb-4">
            Send the link to the new member so they register under the correct branch.
          </p>
          {(() => {
            const { left, right } = buildRefLinks();
            return (
              <div className="space-y-3">
                <div className="bg-slate-700/60 border border-emerald-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-emerald-300">Left branch</span>
                    <button
                      onClick={() => copyToClipboard(left)}
                      className="px-2 py-1 text-xs font-semibold rounded bg-emerald-500 text-gray-900 hover:bg-emerald-400 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-xs break-all text-emerald-100/90">{left}</div>
                </div>
                <div className="bg-slate-700/60 border border-emerald-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-emerald-300">Right branch</span>
                    <button
                      onClick={() => copyToClipboard(right)}
                      className="px-2 py-1 text-xs font-semibold rounded bg-emerald-500 text-gray-900 hover:bg-emerald-400 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-xs break-all text-emerald-100/90">{right}</div>
                </div>
              </div>
            );
          })()}
          {copyMessage && (
            <p className="mt-3 text-xs text-emerald-200">{copyMessage}</p>
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowRefModal(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-gray-900 hover:bg-emerald-400 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default BinaryTreeMemberList;