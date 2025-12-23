import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

function BalanceSection({ balance, commissions, loading = false }) {
  const navigate = useNavigate();

  // Lấy giá trị từ balance object - API mới đã tính sẵn
  const usdtBalance = Number(balance?.usdtBalance || 0);
  const novaBalance = Number(balance?.novaBalance || 0);
  const novaValueInUsdt = Number(balance?.novaValueInUsdt || 0);
  const dailyBalance = Number(balance?.dailyBalance || 0);
  const totalCommission = Number(balance?.totalCommission || 0);

  const balanceCards = [
    {
      label: 'Balance USDT',
      value: formatCurrency(usdtBalance, 'USDT'),
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Balance NOVA',
      value: formatCurrency(novaBalance, 'NOVA'),
      color: 'cyan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      subLines: [
        { label: `≈ ${formatCurrency(novaValueInUsdt, 'USDT')}`}
      ]
    },
    // {
    //   label: 'Daily Interest Balance',
    //   value: formatCurrency(dailyBalance, balance?.currency || 'USDT'),
    //   color: 'blue',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    //     </svg>
    //   )
    // },
    {
      label: 'Total Income',
      value: formatCurrency(dailyBalance + totalCommission, balance?.incomeCurrency || 'USDT'),
      color: 'emerald',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      subLines: [
        { label: 'Daily Interest', value: formatCurrency(dailyBalance, balance?.incomeCurrency || 'USDT') },
        { label: 'Total Commissions', value: formatCurrency(totalCommission, balance?.incomeCurrency || 'USDT') }
      ]
    }
  ];

  const colorClasses = {
    green: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      textLight: 'text-green-300',
      icon: 'text-green-400',
      gradient: 'from-green-500/30 to-green-600/10'
    },
    cyan: {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      textLight: 'text-cyan-300',
      icon: 'text-cyan-400',
      gradient: 'from-cyan-500/30 to-cyan-600/10'
    },
    blue: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      textLight: 'text-blue-300',
      icon: 'text-blue-400',
      gradient: 'from-blue-500/30 to-blue-600/10'
    },
    emerald: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      textLight: 'text-emerald-300',
      icon: 'text-emerald-400',
      gradient: 'from-emerald-500/30 to-emerald-600/10'
    }
  };

  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
      <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 mb-3">
        Balance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {balanceCards.map((card, index) => {
          const colors = colorClasses[card.color];
          
          // Mapping card label to target route
          const handleClick = () => {
            if (card.label === 'Balance USDT') {
              navigate('/deposit?token=USDT');
              return;
            }
            if (card.label === 'Balance NOVA') {
              navigate('/deposit?token=NOVA');
              return;
            }
            if (card.label === 'Total Income') {
              navigate('/report/daily-interest');
              return;
            }
          };

          return (
            <div
              key={index}
              onClick={handleClick}
              className={`${colors.bg} ${colors.border} rounded-lg p-4 border-2 glow-border hover:scale-105 transition-all duration-200 relative overflow-hidden group cursor-pointer`}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Decorative gradient circle */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs ${colors.textLight} font-medium`}>
                    {card.label}
                  </p>
                  <div className={`${colors.icon} transform group-hover:scale-110 transition-transform duration-200`}>
                    {card.icon}
                  </div>
                </div>
                <p className={`text-2xl font-bold ${colors.text} group-hover:scale-105 transition-transform duration-200`}>
                  {loading ? '...' : card.value}
                </p>
                {card.subLines && card.subLines.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {card.subLines.map((sub, idx) => (
                      <div key={idx} className="text-xs text-emerald-200/80 flex justify-between">
                        <span>{sub.label}</span>
                        {sub.value && <span className="font-semibold">{sub.value}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BalanceSection;