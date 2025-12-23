import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

function CommissionStats({ commissions, currency = 'USDT' }) {
  const navigate = useNavigate();
  const stats = [
    {
      label: 'Direct Commission',
      value: commissions.directCommission,
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Binary Commission',
      value: commissions.binaryCommission,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      label: 'Leader Commission',
      value: commissions.leaderCommission,
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: 'POP Commission',
      value: commissions.popCommission,
      color: 'pink',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ];

  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      textLight: 'text-yellow-300',
      icon: 'text-yellow-400',
      gradient: 'from-yellow-500/30 to-yellow-600/10'
    },
    blue: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      textLight: 'text-blue-300',
      icon: 'text-blue-400',
      gradient: 'from-blue-500/30 to-blue-600/10'
    },
    purple: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      textLight: 'text-purple-300',
      icon: 'text-purple-400',
      gradient: 'from-purple-500/30 to-purple-600/10'
    },
    pink: {
      bg: 'bg-pink-500/20',
      border: 'border-pink-500/50',
      text: 'text-pink-400',
      textLight: 'text-pink-300',
      icon: 'text-pink-400',
      gradient: 'from-pink-500/30 to-pink-600/10'
    }
  };

  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
      <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 mb-3">
        Commission Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const colors = colorClasses[stat.color];

          const handleClick = () => {
            if (stat.label === 'Direct Commission') {
              navigate('/report/direct-commission');
              return;
            }
            if (stat.label === 'Binary Commission') {
              navigate('/report/binary-commission');
              return;
            }
            if (stat.label === 'Leadership Commission') {
              navigate('/report/leadership-commission');
              return;
            }
            if (stat.label === 'POP Commission') {
              navigate('/report/pop-commission');
              return;
            }
          };
          return (
            <div
              key={stat.label}
              onClick={handleClick}
              className={`${colors.bg} ${colors.border} rounded-lg p-4 border-2 glow-border hover:scale-105 transition-all duration-200 relative overflow-hidden group cursor-pointer`}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Decorative gradient circle */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${colors.bg} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs ${colors.textLight} font-medium`}>
                    {stat.label}
                  </p>
                  <div className={`${colors.icon} transform group-hover:scale-110 transition-transform duration-200`}>
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-xl font-bold ${colors.text} group-hover:scale-105 transition-transform duration-200`}>
                  {formatCurrency(stat.value, "USDT")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommissionStats;

