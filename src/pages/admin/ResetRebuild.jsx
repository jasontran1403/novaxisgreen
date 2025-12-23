import { useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { useToast } from '../../customHook/useToast';

function ResetRebuild() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [recalcNovaLoading, setRecalcNovaLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleResetAndRebuild = async () => {
    if (!confirm('⚠️ WARNING: This will delete all balances and commissions, then recalculate from history. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('⚠️ This action cannot be undone. Type "RESET" to confirm:')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress('Starting reset and rebuild process...');
      setResult(null);

      const res = await api.post(API_ENDPOINTS.ADMIN.RESET_REBUILD);

      if (res.success) {
        setResult(res.data);
        setProgress('Reset and rebuild completed successfully!');
      } else {
        setError(res.error || 'Failed to reset and rebuild');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset and rebuild');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalcNovaBalances = async () => {
    if (!confirm('Chi trả lãi ngày, giai đoạn test, có thể trả trùng!')) {
      return;
    }

    try {
      setRecalcNovaLoading(true);
      setError('');
      setProgress('Server đang xử lý dữ liệu, chi trả sẽ chạy ngầm...');

      const res = await api.get(API_ENDPOINTS.ADMIN.PAY_DAILY);

      if (res.success) {
        setResult(res.data);
        setProgress('Server đang xử lý dữ liệu, chi trả sẽ chạy ngầm...');
      } else {
        setError(res.error || 'Failed to pay daily');
      }
    } catch (err) {
      setError(err.message || 'Failed to pay daily');
    } finally {
      setRecalcNovaLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-red-500/50 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-red-400 mb-2">Reset & Rebuild System</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
          This will delete all balances and commissions, then recalculate everything from transaction history.
        </p>

        {/* Warning */}
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-red-400 font-semibold mb-2 text-sm sm:text-base">⚠️ Warning</h3>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>All wallet balances (USDT, NOVA) will be reset to 0</li>
            <li>All commission records will be deleted</li>
            <li>All daily interest records will be deleted</li>
            <li>System will recalculate from transaction history:</li>
            <ul className="ml-4 sm:ml-6 mt-2 space-y-1">
              <li>Deposits</li>
              <li>Withdrawals</li>
              <li>Transfers</li>
              <li>Swaps</li>
              <li>Investments</li>
              <li>Commissions (Direct, Binary, Leadership)</li>
              <li>Daily Interest</li>
            </ul>
          </ul>
        </div>

        {/* Progress */}
        {loading && progress && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-400"></div>
              <span className="text-blue-400 text-xs sm:text-sm">{progress}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <span className="text-red-400 text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-green-400 font-semibold mb-2 text-sm sm:text-base">✅ Reset & Rebuild Completed</h3>
            <div className="text-xs sm:text-sm text-slate-300 space-y-1">
              <div>Users processed: {result.usersProcessed || 0}</div>
              <div>Balances recalculated: {result.balancesRecalculated || 0}</div>
              <div>Commissions recalculated: {result.commissionsRecalculated || 0}</div>
              <div>Daily interests recalculated: {result.dailyInterestsRecalculated || 0}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <button
          onClick={handleResetAndRebuild}
          disabled={loading}
          className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
        >
          {loading ? 'Processing...' : 'Reset & Rebuild System'}
        </button>

        <div className="mt-3 sm:mt-4 border-t border-red-500/30 pt-3 sm:pt-4">
          <h3 className="text-[24px] font-semibold text-blue-300 mb-2">
            Pay daily function
          </h3>
          <button
            onClick={handleRecalcNovaBalances}
            disabled={recalcNovaLoading}
            className="cursor-pointer w-full px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            {recalcNovaLoading ? 'Paying...' : 'Pay Daily'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-3 sm:p-4 md:p-6">
        <h3 className="text-emerald-400 font-semibold mb-2 text-sm sm:text-base">How it works:</h3>
        <ol className="text-xs sm:text-sm text-slate-300 space-y-2 list-decimal list-inside">
          <li>Delete all wallet balances (USDT, NOVA)</li>
          <li>Delete all commission records (Direct, Binary, Leadership)</li>
          <li>Delete all daily interest records</li>
          <li>Recalculate balances from transaction history:
            <ul className="ml-4 sm:ml-6 mt-1 space-y-1 list-disc">
              <li>Add deposits to USDT balance</li>
              <li>Subtract withdrawals from USDT balance</li>
              <li>Process transfers (sender - amount, receiver + amount)</li>
              <li>Process swaps (USDT → NOVA conversion)</li>
              <li>Subtract investments from USDT balance</li>
            </ul>
          </li>
          <li>Recalculate commissions from investment history</li>
          <li>Recalculate daily interest from investment history</li>
        </ol>
      </div>
    </div>
  );
}

export default ResetRebuild;

