import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../customHook/useToast';
import Pagination from '../components/Pagination'; // Đảm bảo bạn có component này

function Withdraw() {
  const toast = useToast();

  // ===== FORM STATES =====
  const [copied, setCopied] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [token, setToken] = useState('USDT');
  const [balances, setBalances] = useState({ USDT: 0, NOVA: 0 });
  const [network] = useState('BNB Smart Chain (BEP20)');
  const [minimumWithdraw] = useState(10);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [isValidatingAmount, setIsValidatingAmount] = useState(false);

  // ===== HISTORY STATES =====
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // ===== CANCEL MODAL =====
  const [cancelModal, setCancelModal] = useState({
    open: false,
    id: null,
    amount: 0,
    token: '',
  });

  const selectedBalance = useMemo(() => balances[token] || 0, [balances, token]);

  const walletSource = useMemo(() => {
    return token === 'USDT' ? 'UsdtWallet' : 'NovaWallet';
  }, [token]);

  // ===== FETCH BALANCES =====
  const fetchBalances = useCallback(async () => {
    try {
      setLoadingBalances(true);
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_BALANCE);
      setBalances({
        USDT: Number(res?.data?.usdtBalance || 0),
        NOVA: Number(res?.data?.novaBalance || 0),
      });
    } catch (err) {
      console.error('Failed to load balances', err);
      setError('Unable to load balance. Please try again.');
    } finally {
      setLoadingBalances(false);
    }
  }, []);

  // ===== FETCH WITHDRAW HISTORY =====
  const fetchWithdrawHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_WITHDRAW_HISTORY, {
        params: { page, limit: 10 },
      });
      setWithdrawHistory(res?.data || []);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load withdraw history:', err);
      toast.error('Unable to load withdrawal history');
    } finally {
      setHistoryLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBalances();
    fetchWithdrawHistory(currentPage);
  }, [fetchBalances, fetchWithdrawHistory, currentPage]);

  // ===== ADDRESS VALIDATION (debounced) =====
  useEffect(() => {
    setAddressError('');
    const address = withdrawAddress.trim();
    if (!address) {
      setIsValidatingAddress(false);
      return;
    }

    setIsValidatingAddress(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await ApiService.get(API_ENDPOINTS.USER.VALIDATE_WALLET_ADDRESS(address));
        if (res?.success && res?.valid) {
          setAddressError('');
        } else {
          setAddressError(res?.error || 'Invalid BSC address. Must start with 0x and contain 42 characters.');
        }
      } catch (err) {
        setAddressError('Failed to validate address.');
      } finally {
        setIsValidatingAddress(false);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [withdrawAddress]);

  // ===== AMOUNT VALIDATION (debounced) =====
  useEffect(() => {
    if (!withdrawAmount) {
      setError('');
      setIsValidatingAmount(false);
      return;
    }

    setIsValidatingAmount(true);
    setError('');

    const amount = parseFloat(withdrawAmount);
    const timeoutId = setTimeout(() => {
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
      } else if (amount < minimumWithdraw) {
        setError(`Minimum withdrawal amount is ${minimumWithdraw} ${token}`);
      } else if (amount > selectedBalance) {
        setError('Insufficient balance');
      } else {
        setError('');
      }
      setIsValidatingAmount(false);
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [withdrawAmount, token, selectedBalance, minimumWithdraw]);

  // ===== UTILS =====
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleMaxClick = () => {
    setWithdrawAmount(selectedBalance.toString());
  };

  const calculateFee = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || isNaN(amount)) return 0;
    const feePercent = amount * 0.01;
    return Math.max(feePercent, 1.0);
  };

  const calculateReceive = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || isNaN(amount)) return 0;
    return amount - calculateFee();
  };

  // ===== HANDLE WITHDRAW =====
  const handleWithdraw = async () => {
    setError('');

    if (!withdrawAddress.trim()) {
      toast.warning('Please enter withdrawal address');
      return;
    }
    if (addressError) {
      toast.error(addressError);
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount < minimumWithdraw || amount > selectedBalance) {
      toast.error(error || 'Invalid amount');
      return;
    }

    try {
      setLoadingSubmit(true);
      const res = await ApiService.post(API_ENDPOINTS.USER.WITHDRAW, {
        address: withdrawAddress.trim(),
        tokenSymbol: token,
        amount: amount,
        walletSource: walletSource,
      });

      if (!res.success) {
        toast.error(res.error || 'Withdraw failed');
        return;
      }

      setWithdrawAddress('');
      setWithdrawAmount('');
      toast.success(`Withdrawal submitted! You will receive ${formatCurrency(calculateReceive(), token)} after fees.`);
      await fetchBalances();
      await fetchWithdrawHistory(1); // Refresh history
    } catch (err) {
      toast.error(err?.message || 'Withdrawal failed');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ===== CANCEL WITHDRAW =====
  const openCancelModal = (item) => {
    setCancelModal({
      open: true,
      id: item.id,
      amount: item.amount,
      token: item.currency || token,
    });
  };

  const confirmCancel = async () => {
    try {
      await ApiService.post(API_ENDPOINTS.USER.CANCEL_WITHDRAW, {
        withdrawId: cancelModal.id,
      });
      toast.success('Withdrawal cancelled successfully');
      setCancelModal({ open: false, id: null, amount: 0, token: '' });
      await fetchWithdrawHistory(currentPage);
      await fetchBalances();
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel withdrawal');
    }
  };

  const isSubmitDisabled =
    !withdrawAddress.trim() ||
    addressError ||
    isValidatingAddress ||
    !withdrawAmount ||
    parseFloat(withdrawAmount) <= 0 ||
    parseFloat(withdrawAmount) < minimumWithdraw ||
    parseFloat(withdrawAmount) > selectedBalance ||
    loadingSubmit;

  // ===== STATUS BADGE =====
  const getStatusInfo = (status) => {
    const normalized = (status || '').toString().trim().toLowerCase();
    const successStatuses = ['thành công', 'thanh cong', 'completed', 'complete', 'success', 'paid'];
    const pendingStatuses = ['pending', 'processing'];

    if (successStatuses.includes(normalized)) {
      return { label: 'Completed', badgeClass: 'bg-green-500/20 text-green-400' };
    }
    if (pendingStatuses.includes(normalized)) {
      return { label: 'Pending', badgeClass: 'bg-yellow-500/20 text-yellow-400' };
    }
    return { label: status || 'Unknown', badgeClass: 'bg-slate-500/20 text-slate-400' };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ================= WITHDRAW FORM ================= */}
      <div className="mx-auto px-4 py-6">
        <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 rounded-full p-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 uppercase">Withdraw {token}</h2>
                <p className="text-xs text-emerald-300/60">From {walletSource === 'UsdtWallet' ? 'USDT Wallet' : 'Nova Wallet'}</p>
              </div>
            </div>

            {/* Token & Network */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-2">Token</label>
                <select
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setWithdrawAmount('');
                  }}
                  className="w-full px-4 py-3 bg-slate-600 border-2 border-emerald-500/50 rounded-lg text-white"
                >
                  <option value="USDT">USDT (BSC-USDT)</option>
                  <option value="NOVA">NOVA</option>
                </select>
                <p className="mt-1 text-xs text-emerald-300/70">
                  Balance: {loadingBalances ? '...' : formatCurrency(selectedBalance, token)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400 mb-2">Network</label>
                <div className="px-4 py-3 bg-slate-600 border-2 border-emerald-500/50 rounded-lg text-white">
                  {network}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-blue-400 mb-2">Withdrawal Address (BSC)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x..."
                  className={`flex-1 px-4 py-3 bg-slate-600 border-2 rounded-lg text-white font-mono ${addressError ? 'border-red-500/70' : 'border-emerald-500/50'} ${isValidatingAddress ? 'pr-10' : ''}`}
                />
                {withdrawAddress && !isValidatingAddress && (
                  <button
                    onClick={() => copyToClipboard(withdrawAddress)}
                    className="px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400"
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                )}
              </div>
              {withdrawAddress.trim() && !isValidatingAddress && (
                <p className={`mt-2 text-xs flex items-center gap-1 ${addressError ? 'text-red-400' : 'text-green-400'}`}>
                  {addressError ? '✗' : '✓'} {addressError || 'Valid BSC address'}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-blue-400 mb-2">Withdrawal Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 pr-16 bg-slate-600 border-2 border-emerald-500/50 rounded-lg text-white"
                />
                <button onClick={handleMaxClick} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                  MAX
                </button>
              </div>
            </div>

            {/* Summary */}
            {withdrawAmount && parseFloat(withdrawAmount) > 0 && !isValidatingAmount && !error && (
              <div className="bg-slate-600/50 rounded-lg p-4 mb-6 border border-emerald-500/30 space-y-2">
                <div className="flex justify-between"><span>Amount</span><span>{formatCurrency(parseFloat(withdrawAmount), token)}</span></div>
                <div className="flex justify-between"><span>Fee (1%, min $1)</span><span className="text-red-400">-{formatCurrency(calculateFee(), token)}</span></div>
                <div className="border-t border-emerald-500/30 pt-2 flex justify-between font-semibold">
                  <span>You Will Receive</span>
                  <span className="text-green-400">{formatCurrency(calculateReceive(), token)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {/* Warnings */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4 mb-6 text-xs text-yellow-300/80 space-y-2">
              <p className="font-medium text-yellow-400">⚠️ Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Double-check address — funds are irreversible</li>
                <li>Minimum: {minimumWithdraw} {token}</li>
                <li>Fee: 1% (min $1)</li>
                <li>Processing time varies</li>
              </ul>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={isSubmitDisabled}
              className={`w-full py-3 rounded-lg font-semibold ${!isSubmitDisabled ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-600/50 text-emerald-300/50 cursor-not-allowed'}`}
            >
              {loadingSubmit ? 'Processing...' : 'Withdraw Now'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= WITHDRAW HISTORY ================= */}
      <div className="mx-auto px-4">
        <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 rounded-full p-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-400 uppercase">Withdrawal History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-emerald-500/30 bg-slate-600/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Receiver</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Hash</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center">Loading...</td></tr>
                ) : withdrawHistory.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-emerald-300/60">No withdrawal history</td></tr>
                ) : (
                  withdrawHistory.map((item) => {
                    const { label, badgeClass } = getStatusInfo(item.status);
                    const isPending = label === 'Pending';
                    const shortAddress = item.receiver
                      ? `${item.receiver.slice(0, 6)}...${item.receiver.slice(-4)}`
                      : '-';

                    return (
                      <tr key={item.id} className="border-b border-emerald-500/10 hover:bg-emerald-500/5">
                        <td className="py-3 px-4 text-xs text-emerald-300/80 whitespace-nowrap">
                          {(() => {
                            const timestamp = Number(item.date || item.createdAt);
                            if (isNaN(timestamp) || timestamp <= 0) {
                              return <span className="text-red-400">Invalid Date</span>;
                            }
                            const date = new Date(timestamp);

                            // Optional: double-check if date is valid
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
                        <td className="py-3 px-4 text-xs">
                          <div>{formatCurrency(item.amount, item.currency || token)}</div>
                          <div className="text-red-400 italic text-xs">Fee {formatCurrency(item.fee || calculateFee(), item.currency || token)}</div>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          <button
                            onClick={() => copyToClipboard(item.receiver)}
                            className="text-emerald-400 hover:underline"
                          >
                            {shortAddress}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {item.hash ? (
                            <a
                              href={`https://bscscan.com/tx/${item.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline"
                            >
                              {item.hash.slice(0, 10)}...
                            </a>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeClass}`}>
                            {label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPending && (
                            <button
                              onClick={() => openCancelModal(item)}
                              className="text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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

      {/* ================= CANCEL MODAL ================= */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg border border-red-500/50 p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Cancel Withdrawal?</h3>
            <p className="text-sm text-emerald-200 mb-6">
              Are you sure you want to cancel this withdrawal of{' '}
              <b>{formatCurrency(cancelModal.amount, cancelModal.token)}</b>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelModal({ open: false, id: null, amount: 0, token: '' })}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
              >
                No, keep it
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Withdraw;