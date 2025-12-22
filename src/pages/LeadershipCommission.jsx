import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function LeadershipCommission() {
  const [totalCommission, setTotalCommission] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // API GET only fetches leadership commission data from database
        // Leadership commission is calculated automatically when binary commission is generated
        const res = await ApiService.get(API_ENDPOINTS.COMMISSION.GET_LEADERSHIP);
        const novaAmount = Number(res?.data?.totalCommission || 0);
        setTotalCommission(novaAmount);
        const historyData = (res?.data?.history || []).map(item => ({
          ...item,
          commission: Number(item.commission || 0),
          salesVolume: Number(item.salesVolume || 0)
        }));
        setHistory(historyData);
      } catch (err) {
        setError(err?.message || 'Failed to load leadership commission');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Card Total Leadership Commission Received */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 mb-2">
                Total Leadership Commission Received
              </h2>
              <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200">
                {formatCurrency(totalCommission, 'NOVA')}
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Leadership Commission History Table */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
          <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 mb-3">
            Leadership Commission History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/30 dark:bg-gray-700/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Sales Volume (NOVA)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Commission Amount (NOVA)
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-emerald-400/70 dark:text-emerald-400/70">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-red-400 dark:text-red-300">
                      {error}
                    </td>
                  </tr>
                ) : (history || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-emerald-400/50 dark:text-emerald-400/50">
                      No results found
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400">
                        {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : '--'}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                        {item.member || '--'}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                        {formatCurrency(item.salesVolume || 0, 'NOVA')}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-green-400 dark:text-green-300">
                        +{formatCurrency(item.commission || 0, 'NOVA')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadershipCommission;

