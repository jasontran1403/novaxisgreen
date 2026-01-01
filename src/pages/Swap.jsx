import { useCallback, useEffect, useMemo, useState } from 'react';
import Pagination from '../components/Pagination';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../customHook/useToast';

function Swap() {
  const toast = useToast();
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [novaBalance, setNovaBalance] = useState(0);
  const [swapAmount, setSwapAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [swapHistory, setSwapHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [direction, setDirection] = useState('NOVA_TO_USDT'); // NOVA_TO_USDT or USDT_TO_NOVA

  // ✅ NEW: State for NOVA price
  const [novaPrice, setNovaPrice] = useState(0); // Default fallback
  const [priceLoading, setPriceLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  // ✅ NEW: Fetch NOVA price from API
  const fetchNovaPrice = useCallback(async () => {
    try {
      setPriceLoading(true);
      console.log('[Swap] Fetching NOVA price...');

      const response = await ApiService.get(API_ENDPOINTS.USER.NOVA_PRICE);

      // response giờ là object { success: true, price: "0.1010" }
      if (!response || !response.success || !response.price) {
        throw new Error('Invalid response format from server');
      }

      const price = parseFloat(response.price);
      if (!isNaN(price) && price > 0) {
        console.log('[Swap] NOVA price fetched:', price);
        setNovaPrice(price);
      } else {
        throw new Error('Invalid or zero NOVA price');
      }
    } catch (err) {
      console.error('[Swap] Error fetching NOVA price:', err);
      setNovaPrice(0);
      toast.error('Không thể lấy giá NOVA. Swap tạm thời không khả dụng.');
    } finally {
      setPriceLoading(false);
    }
  }, []);

  // ✅ Dynamic swap rate based on direction and fetched price
  const swapRate = useMemo(() => {
    return direction === 'NOVA_TO_USDT' ? novaPrice : (1.0 / novaPrice);
  }, [direction, novaPrice]);

  // Get from/to currencies based on direction
  const fromCurrency = useMemo(() => {
    return direction === 'NOVA_TO_USDT' ? 'NOVA' : 'USDT';
  }, [direction]);

  const toCurrency = useMemo(() => {
    return direction === 'NOVA_TO_USDT' ? 'USDT' : 'NOVA';
  }, [direction]);

  // Get max balance based on direction
  const maxBalance = useMemo(() => {
    return direction === 'NOVA_TO_USDT' ? novaBalance : usdtBalance;
  }, [direction, novaBalance, usdtBalance]);

  const getStatusInfo = (status) => {
    const normalized = (status || '').toString().trim().toLowerCase();
    const successStatuses = ['thành công', 'thanh cong', 'completed', 'complete', 'success'];

    if (successStatuses.includes(normalized)) {
      return {
        label: 'Complete',
        badgeClass: 'bg-green-500/20 text-green-400 dark:text-green-300'
      };
    }

    return {
      label: status || 'Pending',
      badgeClass: 'bg-yellow-500/20 text-yellow-400 dark:text-yellow-300'
    };
  };

  const fetchBalances = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_BALANCE);
      setUsdtBalance(Number(res?.data?.usdtBalance || 0));
      setNovaBalance(Number(res?.data?.novaBalance || 0));
    } catch (err) {
      setError(err?.message || 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSwapHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_SWAP_HISTORY, {
        params: { page, limit: 10 }
      });
      setSwapHistory(res?.data || []);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load swap history');
      setModal({
        open: true,
        title: 'Swap history error',
        message: err?.message || 'Unable to load swap history. Please try again.',
        type: 'error'
      });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  // ✅ Fetch NOVA price on mount
  useEffect(() => {
    fetchNovaPrice();
    fetchBalances();
    fetchSwapHistory(currentPage);
  }, [fetchNovaPrice, fetchBalances, fetchSwapHistory, currentPage]);

  const handleSwapAmountChange = (e) => {
    const value = e.target.value;
    setSwapAmount(value);
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      const calculated = (parseFloat(value) * swapRate).toFixed(direction === 'NOVA_TO_USDT' ? 4 : 2);
      setReceiveAmount(calculated);
    } else {
      setReceiveAmount('');
    }
  };

  const handleMaxClick = () => {
    setSwapAmount(maxBalance.toString());
    const calculated = (maxBalance * swapRate).toFixed(direction === 'NOVA_TO_USDT' ? 4 : 2);
    setReceiveAmount(calculated);
  };

  // Toggle swap direction
  const handleToggleDirection = () => {
    setDirection(prev => prev === 'NOVA_TO_USDT' ? 'USDT_TO_NOVA' : 'NOVA_TO_USDT');
    setSwapAmount('');
    setReceiveAmount('');
  };

  const handleSwap = async () => {
    const amount = parseFloat(swapAmount);

    if (!amount || amount <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }

    if (amount > maxBalance) {
      toast.error(`Insufficient ${fromCurrency} balance`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const toReceive = amount * swapRate;

      // Send fromCurrency to backend
      const res = await ApiService.post(API_ENDPOINTS.USER.SWAP, {
        amount: amount,
        fromCurrency: fromCurrency
      });

      if (!res.success) {
        toast.error(res.error || 'Swap failed');
        return;
      }

      setUsdtBalance(Number(res?.data?.balanceUSDT || 0));
      setNovaBalance(Number(res?.data?.balanceNOVA || 0));

      setSwapAmount('');
      setReceiveAmount('');

      await fetchSwapHistory();
      showModal(
        'success',
        'Swap successful',
        `Swapped ${formatCurrency(amount, fromCurrency)} to ${formatCurrency(toReceive, toCurrency)}`
      );
    } catch (err) {
      setError(err?.message || 'Swap failed');
      showModal('error', 'Swap failed', err?.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Wallet Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* USDT Wallet */}
          <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 mb-2">
                  USDT Wallet
                </h2>
                <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200">
                  {loading ? '...' : formatCurrency(usdtBalance, 'USDT')}
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

          {/* NOVA Wallet */}
          <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-blue-500/50 dark:border-blue-400/50 p-6 glow-border glow-border-hover">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-400 dark:text-blue-300 mb-2">
                  NOVA Wallet
                </h2>
                <p className="text-3xl font-bold text-blue-300 dark:text-blue-200">
                  {loading ? '...' : formatCurrency(novaBalance, 'NOVA')}
                </p>
              </div>
              <div className="bg-blue-500/20 dark:bg-blue-400/20 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-blue-400 dark:text-blue-300"
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
        </div>

        {/* Swap Form */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
          <div className="flex items-center gap-3 mb-6">
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
              Swap {fromCurrency} to {toCurrency}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Exchange Rate Info */}
            <div className="bg-slate-600/50 dark:bg-gray-700/50 rounded-lg p-4 border border-emerald-500/30 dark:border-emerald-400/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300/80 dark:text-emerald-400/80">
                  Exchange Rate
                </span>
                <span className="text-lg font-semibold text-emerald-400 dark:text-emerald-300">
                  {/* ✅ Dynamic rate display */}
                  {priceLoading ? (
                    'Loading...'
                  ) : direction === 'NOVA_TO_USDT' ? (
                    `1 NOVA = ${novaPrice.toFixed(4)} USDT`
                  ) : (
                    `1 USDT = ${(1 / novaPrice).toFixed(2)} NOVA`
                  )}
                </span>
              </div>
            </div>

            {/* From */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
                From ({fromCurrency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={swapAmount}
                  onChange={handleSwapAmountChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  max={maxBalance}
                  className="w-full px-4 py-3 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 text-lg font-medium focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all pr-20"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-400 dark:text-emerald-300 rounded-lg text-xs font-medium transition-all"
                >
                  MAX
                </button>
              </div>
              <p className="mt-1 text-xs text-emerald-300/60 dark:text-emerald-400/60">
                Available: {formatCurrency(maxBalance, fromCurrency)}
              </p>
            </div>

            {/* Swap Arrow - CLICKABLE */}
            <div className="flex justify-center">
              <button
                onClick={handleToggleDirection}
                className="bg-slate-600/50 dark:bg-gray-700/50 hover:bg-emerald-500/20 dark:hover:bg-emerald-400/20 rounded-full p-3 border border-emerald-500/30 dark:border-emerald-400/30 transition-all group cursor-pointer"
                title="Click to swap direction"
              >
                <svg
                  className={`w-6 h-6 text-emerald-400 dark:text-emerald-300 transition-transform duration-300`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
                To ({toCurrency})
              </label>
              <input
                type="text"
                value={receiveAmount || '0.00'}
                readOnly
                className="w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border-2 border-emerald-500/30 dark:border-emerald-400/30 rounded-lg text-emerald-300 dark:text-emerald-400 text-lg font-medium focus:outline-none cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-emerald-300/60 dark:text-emerald-400/60">
                You will receive
              </p>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={
                !swapAmount ||
                parseFloat(swapAmount) <= 0 ||
                parseFloat(swapAmount) > maxBalance ||
                priceLoading ||
                novaPrice <= 0  // ← thêm điều kiện này để an toàn
              }
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${swapAmount &&
                  parseFloat(swapAmount) > 0 &&
                  parseFloat(swapAmount) <= maxBalance &&
                  !priceLoading &&
                  novaPrice > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-gray-900'
                  : 'bg-slate-600/50 text-emerald-300/50 dark:bg-gray-700/50 dark:text-emerald-400/50 cursor-not-allowed'
                }`}
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              {priceLoading
                ? 'Loading...'
                : novaPrice <= 0
                  ? 'NOVA price error'
                  : 'Swap Now'}
            </button>

          </div>
        </div>

        {/* Swap History */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
              Swap History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30 bg-slate-600/30 dark:bg-gray-700/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    From
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    To
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Rate
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {swapHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-emerald-300/60 dark:text-emerald-400/60">
                      {historyLoading ? 'Loading...' : 'No swap history found'}
                    </td>
                  </tr>
                ) : (
                  swapHistory.map((swap) => (
                    <tr
                      key={swap.id}
                      className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                        {(() => {
                          const timestamp = Number(swap.date || swap.createdAt);
                          if (isNaN(timestamp) || timestamp <= 0) {
                            return <span className="text-red-400">Invalid Date</span>;
                          }
                          const date = new Date(timestamp);

                          if (isNaN(date.getTime())) {
                            return <span className="text-red-400">Invalid Date</span>;
                          }

                          return (
                            <div className="text-xs text-emerald-300/80 whitespace-nowrap">
                              <div className="font-medium">
                                {date.toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                              <div className="text-emerald-300/60">
                                {date.toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(swap.fromAmount, swap.from)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(swap.toAmount, swap.to)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                        {formatCurrency(swap.toAmount, swap.to)}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                        {swap.rate}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {(() => {
                          const { label, badgeClass } = getStatusInfo(swap.status);
                          return (
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeClass}`}>
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
        </div>
      </div>

      {/* Swap status modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 text-emerald-50 rounded-lg border border-emerald-500/60 p-6 max-w-md w-full mx-4 shadow-xl glow-border">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-full ${modal.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
                  }`}
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
                    d={
                      modal.type === 'success'
                        ? 'M5 13l4 4L19 7'
                        : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    }
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{modal.title}</h3>
                <p className="text-sm text-emerald-100/80">{modal.message}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-gray-900 hover:bg-emerald-400 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Swap;