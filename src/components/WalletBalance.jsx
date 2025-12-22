import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

function WalletBalance({ balance, balanceLoading, commissions }) {
  const navigate = useNavigate();

  const handleUSDTClick = () => {
    navigate('/deposit?token=USDT');
  };

  const handleNOVAClick = () => {
    navigate('/deposit?token=NOVA');
  };

  const handleDevelopmentCommissionClick = () => {
    navigate('/report/daily-interest');
  };

  // Calculate development commission if commissions prop is provided
  const dailyInterest = Number(commissions?.dailyInterest || 0);
  const interestOnInterest = Number(commissions?.interestOnInterest || 0);
  const otherCommissionKeys = [
    'directCommission',
    'binaryCommission',
    'leadershipCommission',
    'compoundCommission'
  ];
  const otherCommissionTotal = otherCommissionKeys.reduce(
    (sum, key) => sum + Number(commissions?.[key] || 0),
    0
  );
  const developmentTotal = dailyInterest + interestOnInterest + otherCommissionTotal;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-emerald-300 dark:text-emerald-400 mb-4">
        Wallet Balance
      </h2>
      {balanceLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${commissions ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div 
            onClick={handleUSDTClick}
            className="bg-slate-600/30 dark:bg-gray-700/30 rounded-lg p-4 border border-emerald-500/30 cursor-pointer hover:bg-slate-600/50 dark:hover:bg-gray-700/50 hover:border-emerald-400/50 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-1">Balance USDT</p>
                <p className="text-2xl font-bold text-emerald-400 dark:text-emerald-300">
                  {formatCurrency(balance.balanceUSDT || 0, 'USDT')}
                </p>
              </div>
              <div className="text-emerald-400 dark:text-emerald-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div 
            onClick={handleNOVAClick}
            className="bg-slate-600/30 dark:bg-gray-700/30 rounded-lg p-4 border border-emerald-500/30 cursor-pointer hover:bg-slate-600/50 dark:hover:bg-gray-700/50 hover:border-emerald-400/50 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-1">Balance NOVA</p>
                <p className="text-2xl font-bold text-emerald-400 dark:text-emerald-300">
                  {formatCurrency(balance.balanceNOVA || 0, 'NOVA')}
                </p>
                <p className="text-xs text-emerald-300/60 dark:text-emerald-400/60 mt-1">
                  ≈ {formatCurrency((balance.balanceNOVA || 0) / 10, 'USDT')}
                </p>
              </div>
              <div className="text-emerald-400 dark:text-emerald-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          {commissions && (
            <div 
              onClick={handleDevelopmentCommissionClick}
              className="bg-slate-600/30 dark:bg-gray-700/30 rounded-lg p-4 border border-emerald-500/30 cursor-pointer hover:bg-slate-600/50 dark:hover:bg-gray-700/50 hover:border-emerald-400/50 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-1">Development Commission</p>
                  <p className="text-2xl font-bold text-emerald-400 dark:text-emerald-300">
                    {formatCurrency(developmentTotal, balance.currency || 'USDT')}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-emerald-300/60 dark:text-emerald-400/60 flex justify-between">
                      <span>Daily Interest</span>
                      <span className="font-semibold">{formatCurrency(dailyInterest, balance.currency || 'USDT')}</span>
                    </div>
                    <div className="text-xs text-emerald-300/60 dark:text-emerald-400/60 flex justify-between">
                      <span>Total Commissions</span>
                      <span className="font-semibold">{formatCurrency(interestOnInterest + otherCommissionTotal, balance.currency || 'USDT')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-emerald-400 dark:text-emerald-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WalletBalance;

