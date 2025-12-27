import { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function DailyInterest() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalInterest, setTotalInterest] = useState(0);
  const [dailyInterestHistory, setDailyInterestHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.USER.GET_DAILY_INTEREST, {
          params: { page: currentPage, limit: pagination.limit }
        });
        if (res?.success) {
          // Backend trả về theo đơn vị hiển thị; yêu cầu hiện tất cả là USDT
          const total = Number(res.data?.totalInterest || 0);
          setTotalInterest(total);

          const historyData = (res.data?.history || []).map(item => ({
            ...item,
            interest: Number(item.interest ?? item.amount ?? 0),
            investmentAmount: Number(item.investmentAmount ?? item.investment ?? 0),
          }));
          setDailyInterestHistory(historyData);

          if (res?.pagination) {
            setPagination(res.pagination);
          } else if (res?.data?.pagination) {
            setPagination(res.data.pagination);
          }
        } else {
          throw new Error(res?.message || 'Unable to fetch data');
        }
      } catch (err) {
        setError(err.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Card Total Interest Received */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 mb-2">
                Total Interest Received
              </h2>
              <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200">
                {formatCurrency(totalInterest, 'USDT')}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Daily Interest History Table */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
          <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 mb-3">
            Daily Interest History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                    Investment Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                    Interest Received
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                    Rate (%)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-xs text-emerald-300/80">
                      Loading data...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-xs text-red-300">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && dailyInterestHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-xs text-emerald-300/80">
                      No daily interest data available.
                    </td>
                  </tr>
                )}
                {!loading && !error && dailyInterestHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US') : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                      {formatCurrency(item.investmentAmount || item.investment || 0, 'USDT')}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-green-400 dark:text-green-300">
                      <div className="">+{formatCurrency(item.interest || item.amount || 0, 'Nova')}</div>
                      <div className="text-[10px] italic text-emerald-300/80 dark:text-emerald-400/80">~ {formatCurrency(item.interest*item.price, 'USDT')}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                      <div className="">Interest: {item.rate ?? 0}%</div>
                      <div className="text-[10px] italic text-yellow-300/80 dark:text-yellow-400/80">1 Nova ~ {item.price ?? 0} USDT</div>
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
          {!loading && !error && dailyInterestHistory.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyInterest;

