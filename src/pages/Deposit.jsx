import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import Pagination from '../components/Pagination'; // Đảm bảo bạn đã có component này

function Deposit() {
  const [searchParams] = useSearchParams();

  // ===== STEP CONTROL =====
  const [step, setStep] = useState(1); // 1=create, 2=pending

  // ===== DATA =====
  const [token, setToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [network] = useState('BNB Smart Chain (BEP20)');
  const [minimumDeposit] = useState(1);

  // ===== UI =====
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // ===== BALANCE =====
  const [balances, setBalances] = useState({ USDT: 0, NOVA: 0 });

  // ===== COUNTDOWN =====
  const [timeLeft, setTimeLeft] = useState(360); // 6 phút

  // ===== DEPOSIT HISTORY =====
  const [depositHistory, setDepositHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // ===== READ TOKEN FROM URL =====
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam === 'USDT' || tokenParam === 'NOVA') {
      setToken(tokenParam);
    }
  }, [searchParams]);

  // ===== FETCH BALANCE =====
  const fetchBalance = async () => {
    try {
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_BALANCE);
      setBalances({
        USDT: Number(res?.data?.usdtBalance || 0),
        NOVA: Number(res?.data?.novaBalance || 0),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ===== FETCH ADDRESS =====
  const fetchDepositAddress = async () => {
    const res = await ApiService.get(API_ENDPOINTS.USER.GET_ADDRESS);
    setDepositAddress(res?.data?.depositAddress || '');
  };

  // ===== FETCH DEPOSIT HISTORY =====
  const fetchDepositHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await ApiService.get(API_ENDPOINTS.USER.GET_DEPOSIT_HISTORY, {
        params: { page, limit: 10 },
      });
      setDepositHistory(res?.data || []);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load deposit history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchDepositHistory(currentPage);
  }, [currentPage, fetchDepositHistory]);

  // ===== COUNTDOWN EFFECT =====
  useEffect(() => {
    if (step !== 2) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ===== COPY =====
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ===== CREATE DEPOSIT =====
  const handleCreateDeposit = async () => {
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter deposit amount');
      return;
    }

    if (Number(amount) < minimumDeposit) {
      setError(`Minimum deposit amount is ${minimumDeposit} ${token}`);
      return;
    }

    try {
      setLoading(true);

      // Gọi API tạo deposit
      const res = await ApiService.post(API_ENDPOINTS.USER.CREATE_DEPOSIT, {
        currency: token,
        amount: Number(amount),
      });

      // Nếu thành công → lấy address từ user (hoặc từ response nếu cần)
      await fetchDepositAddress(); // giữ nguyên để lấy address

      setTimeLeft(360);
      setStep(2);

      // Optional: refresh history
      fetchDepositHistory(1);

    } catch (err) {
      setError(err?.message || 'Failed to create deposit');
    } finally {
      setLoading(false);
    }
  };

  // ===== CANCEL =====
  const handleCancel = () => {
    setStep(1);
    setAmount('');
    setDepositAddress('');
    setTimeLeft(360);
  };

  // Hàm lấy class cho status badge (tương tự Swap)
  const getStatusInfo = (status) => {
    const normalized = (status || '').toString().trim().toLowerCase();
    const successStatuses = ['thành công', 'thanh cong', 'completed', 'complete', 'success'];

    if (successStatuses.includes(normalized)) {
      return {
        label: 'Complete',
        badgeClass: 'bg-green-500/20 text-green-400',
      };
    }

    return {
      label: status || 'Pending',
      badgeClass: 'bg-yellow-500/20 text-yellow-400',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* ================= DEPOSIT FORM ================= */}
      <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-400 mb-6">
          Deposit {token}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="mb-4">
              <label className="block text-sm text-emerald-400 mb-2">Token</label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-slate-600 border-2 border-emerald-500/50 rounded-lg text-white"
              >
                <option value="USDT">USDT (BSC)</option>
                <option value="NOVA">NOVA</option>
              </select>
              <p className="mt-1 text-xs text-emerald-300">
                Balance:{' '}
                {formatCurrency(
                  token === 'USDT' ? balances.USDT : balances.NOVA,
                  token
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-blue-400 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-600 border-2 border-emerald-500/50 rounded-lg text-white"
              />
            </div>

            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

            <button
              onClick={handleCreateDeposit}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold"
            >
              {loading ? 'Creating...' : 'Create Deposit'}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <span
                className={`text-lg font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-emerald-400'
                  }`}
              >
                Time left: {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={depositAddress} size={200} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-blue-400 mb-2">
                {token} Deposit Address
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={depositAddress}
                  className="flex-1 px-4 py-3 bg-slate-600 border-2 border-emerald-500/50 rounded-lg text-white font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-lg"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="text-sm text-emerald-300 mb-4">
              Token: <b>{token}</b>
              <br />
              Amount: <b>{formatCurrency(Number(amount), token)}</b>
              <br />
              Network: <b>{network}</b>
            </div>

            <div className="bg-yellow-500/10 mb-4 border-2 border-yellow-500/30 rounded-lg p-4 space-y-2">
              <p className="text-sm text-yellow-400 font-medium">
                ⚠️ Important Instructions:
              </p>
              <ul className="text-xs text-yellow-300/80 space-y-1 list-disc list-inside">
                <li>Send only {token} to this deposit address.</li>
                <li>
                  Make sure that the network for depositing matches the network
                  for withdrawing, otherwise assets may be lost.
                </li>
                <li>Do not send other cryptocurrencies to this address.</li>
                <li>
                  Minimum deposit amount is {minimumDeposit} {token}.
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg bg-slate-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-lg bg-emerald-500 text-white"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>

      {/* ================= DEPOSIT HISTORY ================= */}
      <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/20 rounded-full p-2">
            <svg
              className="w-6 h-6 text-emerald-400"
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
          <h2 className="text-lg font-semibold text-emerald-400 uppercase">
            Deposit History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-600/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">
                  Hash
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">
                  Currency
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {depositHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-emerald-300/60"
                  >
                    {historyLoading ? 'Loading...' : 'No deposit history found'}
                  </td>
                </tr>
              ) : (
                depositHistory.map((item) => {
                  const { label, badgeClass } = getStatusInfo(item.status);
                  return (
                    <tr
                      key={item.id || item.hash}
                      className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"
                    >
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
                      <td className="py-3 px-4 text-xs text-emerald-300/80">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 font-mono break-all max-w-xs">
                        {item.hash ? (
                          <a
                            href={`https://bscscan.com/tx/${item.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline"
                          >
                            {item.hash.slice(0, 12)}...{item.hash.slice(-10)}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80">
                        {item.currency || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${badgeClass}`}
                        >
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
  );
}

export default Deposit;