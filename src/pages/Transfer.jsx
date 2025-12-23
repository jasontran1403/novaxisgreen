import { useCallback, useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../customHook/useToast';

function Transfer() {
  const toast = useToast();
  const [recipientUsername, setRecipientUsername] = useState('');
  const [recipientFullName, setRecipientFullName] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [isValidatingRecipient, setIsValidatingRecipient] = useState(false);
  const [amount, setAmount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('NOVA');
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [novaBalance, setNovaBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [transferHistory, setTransferHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_TRANSACTIONS, {
        params: { page, limit: 10 }
      });
      setTransferHistory(res?.data || []);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setTransferHistory([]);
    }
  }, []);

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

  useEffect(() => {
    fetchBalances();
    fetchHistory(currentPage);
  }, [fetchBalances, fetchHistory, currentPage]);

  // Debounced username validation (1200ms)
  useEffect(() => {
    // Clear previous validation
    setRecipientFullName('');
    setRecipientError('');

    const username = recipientUsername.trim();

    // Don't validate if empty
    if (!username) {
      return;
    }

    // Set loading state
    setIsValidatingRecipient(true);

    // Debounce: wait 1200ms after user stops typing
    const timeoutId = setTimeout(async () => {
      try {
        const res = await ApiService.get(API_ENDPOINTS.USER.VALIDATE_USERNAME(username));

        if (res?.success && res?.found) {
          // User found
          setRecipientFullName(res.data.fullName);
          setRecipientError('');
        } else {
          // User not found
          setRecipientFullName('');
          setRecipientError(res?.error || "Can't found receiver by this username");
        }
      } catch (err) {
        // Error or user not found
        setRecipientFullName('');
        setRecipientError(err?.response?.data?.error || "Can't found receiver by this username");
      } finally {
        setIsValidatingRecipient(false);
      }
    }, 1200); // Wait 1200ms

    // Cleanup function: cancel timeout if user types again
    return () => {
      clearTimeout(timeoutId);
      setIsValidatingRecipient(false);
    };
  }, [recipientUsername]);

  const handleMaxClick = () => {
    const max = tokenSymbol === 'USDT' ? usdtBalance : novaBalance;
    setAmount(max.toString());
  };

  const handleTransfer = async () => {
    if (!recipientUsername.trim()) {
      toast.warning('Please enter recipient username');
      return;
    }

    if (recipientError) {
      toast.error(recipientError);
      return;
    }

    if (!recipientFullName) {
      toast.warning('Please wait for username validation');
      return;
    }

    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const currentBalance = tokenSymbol === 'USDT' ? usdtBalance : novaBalance;
    if (transferAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await ApiService.post(API_ENDPOINTS.USER.TRANSFER, {
        recipientUsername: recipientUsername.trim(),
        amount: transferAmount,
        tokenSymbol
      });

      if (!res.success) {
        toast.error(res.error || 'Transfer failed');
        return;
      }

      await fetchBalances();
      await fetchHistory();

      // Reset form
      setRecipientUsername('');
      setRecipientFullName('');
      setRecipientError('');
      setAmount('');

      toast.success(`Successfully transferred ${formatCurrency(transferAmount, tokenSymbol)} to ${recipientUsername}`);
    } catch (err) {
      setError(err?.message || 'Transfer failed');
      toast.error(err?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  // Check if submit button should be disabled
  const isSubmitDisabled =
    !recipientUsername.trim() ||
    recipientError ||
    !recipientFullName ||
    isValidatingRecipient ||
    !amount ||
    parseFloat(amount) <= 0 ||
    parseFloat(amount) > (tokenSymbol === 'USDT' ? usdtBalance : novaBalance) ||
    loading;

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Transfer Form */}
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
              Transfer Funds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Recipient Username */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
                Recipient username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  placeholder="username"
                  className={`w-full px-4 py-3 bg-slate-600 dark:bg-gray-700 border-2 ${recipientError
                      ? 'border-red-500/70 dark:border-red-400/70'
                      : 'border-emerald-500/50 dark:border-emerald-400/50'
                    } rounded-lg text-emerald-300 dark:text-emerald-400 placeholder-emerald-300/40 dark:placeholder-emerald-400/40 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all ${isValidatingRecipient ? 'pr-10' : ''
                    }`}
                />
                {/* Loading indicator */}
                {isValidatingRecipient && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-emerald-400 dark:text-emerald-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Validation result */}
              {recipientUsername.trim() && !isValidatingRecipient && (
                <div className="mt-1">
                  {recipientError ? (
                    <p className="text-xs text-red-400 dark:text-red-300 flex items-center gap-1">
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {recipientError}
                    </p>
                  ) : recipientFullName ? (
                    <p className="text-xs text-green-400 dark:text-green-300 flex items-center gap-1">
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
                      {recipientFullName}
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-300/70 dark:text-emerald-400/70">
                      Full name: ---
                    </p>
                  )}
                </div>
              )}

              {!recipientUsername.trim() && (
                <p className="mt-1 text-xs text-emerald-300/70 dark:text-emerald-400/70">
                  Full name: ---
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.01"
                  max={tokenSymbol === 'USDT' ? usdtBalance : novaBalance}
                  className="w-full px-4 py-3 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 placeholder-emerald-300/40 dark:placeholder-emerald-400/40 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all pr-16"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-400 dark:text-emerald-300 rounded-lg text-xs font-medium transition-all"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
                Token
              </label>
              <select
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="w-full px-4 py-3 bg-slate-600 dark:bg-gray-700 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 font-medium focus:outline-none"
              >
                <option value="NOVA">NOVA</option>
                <option value="USDT">USDT</option>
              </select>
              <p className="mt-1 text-xs text-emerald-300/60 dark:text-emerald-400/60">
                Balance: {tokenSymbol === 'USDT' ? formatCurrency(usdtBalance, 'USDT') : formatCurrency(novaBalance, 'NOVA')}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleTransfer}
              disabled={isSubmitDisabled}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${!isSubmitDisabled
                  ? 'bg-blue-500 hover:bg-blue-400 text-white dark:bg-blue-400 dark:hover:bg-blue-300 dark:text-gray-900'
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {isValidatingRecipient ? 'Validating...' : 'Submit transfer'}
            </button>
          </div>
        </div>

        {/* Transfer History */}
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
              Transfer History
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
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    From/To
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Token
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300 uppercase whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transferHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-emerald-300/60 dark:text-emerald-400/60">
                      No transfer history found
                    </td>
                  </tr>
                ) : (
                  transferHistory.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80 whitespace-nowrap">
                        {(() => {
                          const timestamp = Number(transfer.date || transfer.createdAt);
                          if (isNaN(timestamp) || timestamp <= 0) {
                            return <span className="text-red-400">Invalid Date</span>;
                          }
                          const date = new Date(timestamp);

                          // Optional: double-check if date is valid
                          if (isNaN(date.getTime())) {
                            return <span className="text-red-400">Invalid Date</span>;
                          }

                          return (
                            <div className={`text-xs ${transfer.type === "in" ? "text-emerald-300/80" : "text-red-300/80"} whitespace-nowrap`}>
                              <div className="font-medium">
                                {date.toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                              <div className={`${transfer.type === "in" ? "text-emerald-300/80" : "text-red-300/80"}`}>
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
                      <td className="py-3 px-4 whitespace-nowrap">
                        {transfer.type === 'in' ? (
                          <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 dark:text-green-300 font-medium flex items-center gap-1.5 w-fit">
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
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                            Transfer In
                          </span>
                        ) : (
                          <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 dark:text-red-300 font-medium flex items-center gap-1.5 w-fit">
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
                                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                              />
                            </svg>
                            Transfer Out
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-xs ${transfer.type === "in" ? "text-emerald-300/80 dark:text-emerald-400/80" : "text-red-300/80 dark:text-red-400/80"} whitespace-nowrap font-medium`}>
                        {transfer.recipient}
                      </td>
                      <td className={`py-3 px-4 text-xs ${transfer.type === "in" ? "text-emerald-300/80 dark:text-emerald-400/80" : "text-red-300/80 dark:text-red-400/80"} whitespace-nowrap`}>
                        {transfer.token}
                      </td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap font-medium">
                        <span className={transfer.type === 'in' ? 'text-green-400 dark:text-green-300' : 'text-red-400 dark:text-red-300'}>
                          {transfer.type === 'in' ? '+' : '-'}{formatCurrency(transfer.amount, transfer.token)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 dark:text-green-300 font-medium">
                          {transfer.status}
                        </span>
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
    </div>
  );
}

export default Transfer;