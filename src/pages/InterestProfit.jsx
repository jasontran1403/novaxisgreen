import { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function InterestProfit() {
  const [history, setHistory] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchInterest = async () => {
      try {
        setLoading(true);
        setError('');
        // Gọi API lãi/lãi (interest on interest) thay vì lãi hàng ngày
        const res = await ApiService.get(API_ENDPOINTS.USER.GET_POP_COMMISSION, {
          params: { page: currentPage, limit: 10 }
        });
        if (res?.success === false) {
          throw new Error(res?.message || res?.error || 'Không tải được dữ liệu lãi/lãi');
        }
        const data = res?.data || res;
        // Backend trả về theo đơn vị hiển thị; yêu cầu hiển thị tất cả là USDT
        const total = Number(data?.totalCommission || 0);
        setTotalCommission(total);
        const historyData = (data?.history || []).map(item => ({
          ...item,
          commission: Number(item.commission || 0),
          downlineInterest: Number(item.downlineInterest || 0)
        }));
        setHistory(historyData);
        if (res?.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        setError(err?.message || 'Không tải được dữ liệu lãi/lãi');
      } finally {
        setLoading(false);
      }
    };

    fetchInterest();
  }, [currentPage]);

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Card Total Commission Received */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 mb-2">
                Total POP Commission Received
              </h2>
              <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200">
                {formatCurrency(totalCommission, 'USDT')}
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

        {/* Interest/Profit Table */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
          <div className="flex items-center gap-3 mb-4">
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
              POP
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/30 dark:bg-gray-700/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Downline Details
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Commission (Nova)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Package Price (USDT)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="py-6 px-4 text-center text-emerald-300/70">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={10} className="py-6 px-4 text-center text-red-300">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && history.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 px-4 text-center text-emerald-300/70">
                      No interest on interest data available.
                    </td>
                  </tr>
                )}
                {!loading && !error && history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US') : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                      <div className="">{item.member || '—'}</div>
                      <div className="">Distance: F{item.level || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-green-400 dark:text-green-300 font-semibold">
                      <div className="">+{formatCurrency(item.commission || 0, 'Nova')}</div>
                      <div className="text-[10px] italic text-emerald-300/80 dark:text-emerald-400/80">~ {formatCurrency(item.commission * item.price, 'USDT')}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                      <div className="">{item.packagePrice > 0 ? `${formatCurrency(item.packagePrice, 'USDT')}` : '—'}</div>
                      <div className="text-[10px] italic text-yellow-300/80 dark:text-yellow-400/80">Rate {item.downlineInterest}% (1 Nova ~ {item.price} USDT)</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 dark:text-green-300`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && history.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default InterestProfit;

