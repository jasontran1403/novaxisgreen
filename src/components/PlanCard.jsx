import { RefreshCw } from 'lucide-react';

function PlanCard({ plan, loading, onRefresh }) {
  const getMaxoutColorClass = (remaining, total) => {
    if (!total || total <= 0) return 'text-slate-400';

    const percent = (remaining / total) * 100;

    if (remaining <= 0) return 'text-red-500';
    if (percent < 5) return 'text-orange-500';
    if (percent < 20) return 'text-yellow-400';
    if (percent < 60) return 'text-cyan-400';   // aqua
    return 'text-emerald-400';
  };


  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 md:p-6 glow-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300">
          Plan Information
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* User Rank */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 dark:text-emerald-300">User Rank</p>
          <p className="text-lg font-bold text-white">
            {loading ? '...' : `${plan.userRank} - ${plan.leaderRank}`}
          </p>
        </div>

        {/* Total Investments */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 dark:text-emerald-300">Total Investments</p>
          <p className="text-lg font-bold text-white">
            {loading ? '...' : `${plan.totalInvestment.toLocaleString()} ${plan.currency}`}
          </p>
        </div>

        {/* Total Direct Member */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 dark:text-emerald-300">Total Direct Member</p>
          <p className="text-lg font-bold text-white">
            {loading ? '...' : plan.totalDirectMember}
          </p>
        </div>

        {/* Total Sales From Direct */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 dark:text-emerald-300">Total Sales From Direct</p>
          <p className="text-lg font-bold text-white">
            {loading ? '...' : `${plan.totalSalesFromDirect.toLocaleString()} ${plan.currency}`}
          </p>
        </div>

        {/* Maxout Remaining */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 dark:text-emerald-300">Maxout Remaining</p>
          <p
            className={`text-lg font-bold ${loading
                ? 'text-slate-400'
                : getMaxoutColorClass(plan.maxoutRemaining, plan.totalMaxout)
              }`}
          >
            {loading
              ? '...'
              : `${plan.maxoutRemaining.toLocaleString()} ${plan.currency} / 
         ${plan.totalMaxout.toLocaleString()} ${plan.currency}`}
          </p>
        </div>

        {/* Total Maxout */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 dark:text-emerald-300">Total Maxout</p>
          <p className="text-lg font-bold text-white">
            {loading ? '...' : `${plan.totalMaxout.toLocaleString()} ${plan.currency}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlanCard;