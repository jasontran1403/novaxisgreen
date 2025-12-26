import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function BinaryCommission() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await ApiService.get(API_ENDPOINTS.USER.GET_BINARY_COMMISSION);
        console.log('[BINARY_COMMISSION] Response:', res);

        const novaAmount = Number(res?.data?.totalCommission || 0);
        setTotalCommission(novaAmount);

        // Safely map history data
        const historyData = (res?.data?.history || []).map(item => ({
          ...item,
          id: item.id || Math.random(),
          date: item.date || null,
          username: item.username || 'Unknown',
          investmentPackage: item.investmentPackage || 'N/A',
          investmentPackagePrice: Number(item.investmentPackagePrice || 0),
          commissionRate: Number(item.commissionRate || 0),
          commissionAmount: Number(item.commissionAmount || 0),
          status: item.status || 'Completed'
        }));

        console.log('[BINARY_COMMISSION] Processed history:', historyData);
        setHistory(historyData);
      } catch (err) {
        console.error('[BINARY_COMMISSION] Error:', err);
        setError(err.message || 'Failed to load binary commission');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safe currency formatter
  const safeCurrencyFormat = (amount, currency = 'NOVA') => {
    try {
      if (amount == null || isNaN(amount)) return '0.00 ' + currency;
      return formatCurrency(amount, currency);
    } catch (e) {
      console.error('[CURRENCY_FORMAT] Error:', e, { amount, currency });
      return `${Number(amount).toFixed(2)} ${currency}`;
    }
  };

  const filteredData = history.filter(item => {
    try {
      if (!searchTerm) return true; // No search term = show all

      const searchLower = searchTerm.toLowerCase();

      // Convert all values to string before toLowerCase
      const dateStr = String(item.date || '');
      const usernameStr = String(item.username || '');
      const packageStr = String(item.investmentPackage || '');
      const priceStr = String(item.investmentPackagePrice || '');
      const amountStr = String(item.commissionAmount || '');
      const rateStr = String(item.commissionRate || '');

      return (
        dateStr.toLowerCase().includes(searchLower) ||
        usernameStr.toLowerCase().includes(searchLower) ||
        packageStr.toLowerCase().includes(searchLower) ||
        priceStr.includes(searchLower) ||
        amountStr.includes(searchLower) ||
        rateStr.includes(searchLower)
      );
    } catch (e) {
      console.error('[FILTER] Error filtering item:', e, item);
      return true; // Include item if filter fails
    }
  });

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Card Total Binary Commission Received */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 mb-2">
                Total Binary Commission Received
              </h2>
              <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200">
                {safeCurrencyFormat(totalCommission, 'USDT')}
              </p>
            </div>
            <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-4">
              <svg
                className="w-12 h-12 text-emerald-400 dark:text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Binary Commission History Table */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
          <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 mb-3">
            Binary Commission History
          </h3>

          {/* Search and Filter Bar */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/30 dark:border-emerald-400/30 rounded-l-lg text-emerald-300 dark:text-emerald-400 placeholder-emerald-500/50 dark:placeholder-emerald-400/50 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
            />
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-r-lg transition-all"
            >
              Filter
            </button>
          </div>

          {/* Filter Options (can be expanded) */}
          {showFilter && (
            <div className="mb-4 p-4 bg-slate-600/30 dark:bg-gray-700/30 rounded-lg border border-emerald-500/20 dark:border-emerald-400/20">
              <p className="text-xs text-emerald-400 dark:text-emerald-300">Filter options can be added here</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/30 dark:bg-gray-700/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Commission Rate (%)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Commission Amount (NOVA)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-emerald-400/70 dark:text-emerald-400/70">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-red-400 dark:text-red-300">
                      {error}
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    try {
                      return (
                        <tr
                          key={item.id || index}
                          className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400">
                            {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            }) : '--'}
                          </td>
                          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                            {item.username || '--'}
                          </td>
                          <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                            <div className="">{Number(item.commissionRate || 0).toFixed(2)}%</div>
                            <div className="text-[10px] italic text-yellow-400 dark:text-yellow-300">1 Nova ~ {formatCurrency(item.price || 0, 'USDT')}</div>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-green-400 dark:text-green-300">
                            <div className="">+{safeCurrencyFormat(item.commissionAmount || 0, 'NOVA')}</div>
                            <div className="text-[10px] italic text-emerald-300/80 dark:text-emerald-400/80">~ {formatCurrency(item.commissionAmount*item.price, 'USDT')}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 dark:text-green-300">
                              {item.status || 'Completed'}
                            </span>
                          </td>
                        </tr>
                      );
                    } catch (rowError) {
                      console.error('[ROW_RENDER] Error rendering row:', rowError, item);
                      return (
                        <tr key={index}>
                          <td colSpan="6" className="py-3 px-4 text-xs text-red-400">
                            Error rendering row {index + 1}
                          </td>
                        </tr>
                      );
                    }
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-emerald-400/50 dark:text-emerald-400/50">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BinaryCommission;