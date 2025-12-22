import { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

function DirectDownlineTable({ members = [], currency = 'USDT' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  // Filter và search
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.memberCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBranch = filterBranch === 'all' || member.branch === filterBranch;
      const matchesLevel = filterLevel === 'all' || member.level?.toString() === filterLevel;
      const matchesPackage = filterPackage === 'all' || member.package === filterPackage;

      return matchesSearch && matchesBranch && matchesLevel && matchesPackage;
    });
  }, [members, searchTerm, filterBranch, filterLevel, filterPackage]);

  // Phân trang
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBranch, filterLevel, filterPackage]);

  // Get list of unique values for filter
  const uniqueLevels = useMemo(() => {
    return [...new Set(members.map(m => m.level))].sort((a, b) => a - b);
  }, [members]);

  const uniquePackages = useMemo(() => {
    return [...new Set(members.map(m => m.package).filter(Boolean))].sort();
  }, [members]);

  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  const handleCloseModal = () => {
    setShowAddMemberModal(false);
    setCopiedLink(null);
  };

  const copyReferralLink = async (position) => {
    // Create referral link - can be fetched from API or context
    const currentUserCode = 'YOU001'; // Can be fetched from context/state
    const refLink = `${window.location.origin}/register?ref=${currentUserCode}&position=${position}`;
    
    try {
      await navigator.clipboard.writeText(refLink);
      setCopiedLink(position);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback cho trình duyệt cũ
      const textArea = document.createElement('textarea');
      textArea.value = refLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(position);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const getReferralLink = (position) => {
    const currentUserCode = 'YOU001'; // Can be fetched from context/state
    return `${window.location.origin}/register?ref=${currentUserCode}&position=${position}`;
  };

  if (members.length === 0) {
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
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
          </div>
          <p className="text-emerald-300/80 dark:text-emerald-400/80 text-sm">
            No direct downline members
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
      {/* Header với nút thêm */}
      <div className="flex items-center justify-between mb-4">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
            Direct Downline Members ({filteredMembers.length})
          </h2>
        </div>
        <button
          onClick={handleAddMember}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-gray-900 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <svg 
            className="w-5 h-5" 
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
          Add Member
        </button>
      </div>

      {/* Search và Filter */}
      <div className="mb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="w-5 h-5 text-emerald-400/50 dark:text-emerald-400/50" 
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
            placeholder="Search by member code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/30 dark:border-emerald-400/30 rounded-lg text-emerald-300 dark:text-emerald-400 placeholder-emerald-300/50 dark:placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-1 focus:ring-emerald-400 dark:focus:ring-emerald-300"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Filter by Branch */}
          <div>
            <label className="block text-xs font-medium text-emerald-400 dark:text-emerald-300 mb-2">
              Filter by Branch
            </label>
            <div className="relative">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 font-medium appearance-none cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-300 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all" className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">All</option>
                <option value="left" className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">Left Branch</option>
                <option value="right" className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">Right Branch</option>
              </select>
            </div>
          </div>

          {/* Filter by Level */}
          <div>
            <label className="block text-xs font-medium text-emerald-400 dark:text-emerald-300 mb-2">
              Filter by Level
            </label>
            <div className="relative">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 font-medium appearance-none cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-300 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all" className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">All</option>
                {uniqueLevels.map(level => (
                  <option key={level} value={level.toString()} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">Level {level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter by Package */}
          <div>
            <label className="block text-xs font-medium text-emerald-400 dark:text-emerald-300 mb-2">
              Filter by Package
            </label>
            <div className="relative">
              <select
                value={filterPackage}
                onChange={(e) => setFilterPackage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 font-medium appearance-none cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-300 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all" className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">All</option>
                {uniquePackages.map(pkg => (
                  <option key={pkg} value={pkg} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">{pkg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/30 dark:bg-gray-700/30">
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                No.
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Member Code
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Name
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Join Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Level
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Investment Package
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Total Investment
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                Branch Position
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-emerald-300/60 dark:text-emerald-400/60">
                  No members found
                </td>
              </tr>
            ) : (
              paginatedMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                >
                  <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400 whitespace-nowrap">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 font-medium whitespace-nowrap">
                    {member.memberCode}
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                    {member.name}
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                    {new Date(member.joinDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 dark:text-blue-300">
                      Level {member.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                    {member.package || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                    {formatCurrency(member.totalInvestment || 0, currency)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {member.branch === 'left' ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 dark:text-blue-300 font-medium flex items-center gap-1.5 w-fit">
                        <svg 
                          className="w-3.5 h-3.5" 
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
                        Left Branch
                      </span>
                    ) : member.branch === 'right' ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 dark:text-orange-300 font-medium flex items-center gap-1.5 w-fit">
                        <svg 
                          className="w-3.5 h-3.5" 
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
                        Right Branch
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 dark:text-gray-300 font-medium">
                        Undefined
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-emerald-300/80 dark:text-emerald-400/80">
              Show:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded text-xs text-emerald-300 dark:text-emerald-400 font-medium appearance-none cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-300 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1em 1em',
                paddingRight: '1.75rem'
              }}
            >
              <option value={5} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">5</option>
              <option value={10} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">10</option>
              <option value={20} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">20</option>
              <option value={50} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">50</option>
            </select>
            <span className="text-xs text-emerald-300/80 dark:text-emerald-400/80">
              / page
            </span>
          </div>

          {/* Page info */}
          <div className="text-xs text-emerald-300/80 dark:text-emerald-400/80">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/30 dark:border-emerald-400/30 rounded text-xs text-emerald-300 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Hiển thị trang đầu, cuối, trang hiện tại và các trang xung quanh
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => {
                  // Thêm ellipsis nếu cần
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="text-emerald-300/50 dark:text-emerald-400/50">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-xs transition-all ${
                          currentPage === page
                            ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-gray-900'
                            : 'bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/30 dark:border-emerald-400/30 text-emerald-300 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-400/20'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/30 dark:border-emerald-400/30 rounded text-xs text-emerald-300 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-700 dark:bg-gray-800 rounded-lg border-2 border-emerald-500/50 dark:border-emerald-400/50 p-6 max-w-md w-full mx-4 glow-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-2">
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
                <h3 className="text-xl font-semibold text-emerald-400 dark:text-emerald-300">
                  Add New Member
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-emerald-300/80 dark:text-emerald-400/80 hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                <svg 
                  className="w-6 h-6" 
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
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-4">
                Share one of these referral links to invite new members:
              </p>

              {/* Left Branch Link */}
              <div className="bg-slate-600/50 dark:bg-gray-700/50 rounded-lg border border-emerald-500/30 dark:border-emerald-400/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 rounded-full p-1.5">
                    <svg 
                      className="w-4 h-4 text-blue-400 dark:text-blue-300" 
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
                  </div>
                  <label className="text-sm font-medium text-emerald-300 dark:text-emerald-400">
                    Left Branch Referral Link
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getReferralLink('left')}
                    className="flex-1 px-3 py-2 bg-slate-700 dark:bg-gray-800 border border-emerald-500/30 dark:border-emerald-400/30 rounded text-xs text-emerald-300 dark:text-emerald-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300"
                  />
                  <button
                    onClick={() => copyReferralLink('left')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-gray-900 rounded font-medium text-xs transition-all flex items-center gap-2"
                  >
                    {copiedLink === 'left' ? (
                      <>
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
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Branch Link */}
              <div className="bg-slate-600/50 dark:bg-gray-700/50 rounded-lg border border-emerald-500/30 dark:border-emerald-400/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-500/20 rounded-full p-1.5">
                    <svg 
                      className="w-4 h-4 text-orange-400 dark:text-orange-300" 
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
                  </div>
                  <label className="text-sm font-medium text-emerald-300 dark:text-emerald-400">
                    Right Branch Referral Link
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getReferralLink('right')}
                    className="flex-1 px-3 py-2 bg-slate-700 dark:bg-gray-800 border border-emerald-500/30 dark:border-emerald-400/30 rounded text-xs text-emerald-300 dark:text-emerald-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300"
                  />
                  <button
                    onClick={() => copyReferralLink('right')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-gray-900 rounded font-medium text-xs transition-all flex items-center gap-2"
                  >
                    {copiedLink === 'right' ? (
                      <>
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
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/30 dark:border-emerald-400/30 rounded-lg p-3">
                <p className="text-xs text-emerald-300/80 dark:text-emerald-400/80">
                  <strong className="text-emerald-400 dark:text-emerald-300">Note:</strong> Share the left branch link to add members to your left branch, or the right branch link to add members to your right branch.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectDownlineTable;
