import { formatCurrency } from '../utils/formatCurrency';
import ReflinkSection from './ReflinkSection';
import { useMemo } from 'react';

function PlanInformation({ plan, planLoading, salesNetwork, salesNetworkLoading, income24h, user }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      textLight: 'text-blue-300',
      icon: 'text-blue-400',
    },
    purple: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      textLight: 'text-purple-300',
      icon: 'text-purple-400',
    },
    green: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      textLight: 'text-green-300',
      icon: 'text-green-400',
    },
    red: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      textLight: 'text-red-300',
      icon: 'text-red-400',
    },
    teal: {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/50',
      text: 'text-cyan-300',
      textLight: 'text-cyan-200',
      icon: 'text-cyan-300',
    },
  };

  const salesCurrency = salesNetwork.currency || plan?.currency || 'USDT';
  const salesValue = formatCurrency(
    Number(salesNetwork.directSales ?? salesNetwork.total ?? 0),
    salesCurrency
  );

  const planCards = plan ? [
    {
      label: 'Username',
      value: plan.username || plan.userId,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      label: 'Rank',
      value: plan.rank || 'Member',
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      label: 'Total Investment Package',
      value: formatCurrency(plan.totalInvestment || 0, plan.currency || 'USDT'),
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Total Direct Members',
      value: plan.f1SponsorCount ?? plan.directMembers ?? 0,
      color: 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      label: 'Sales Network (Direct)',
      value: salesNetworkLoading ? 'Loading...' : salesValue,
      color: 'teal',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h12m0 0l-4-4m4 4l-4 4m6 6H5m0 0l4-4m-4 4l4 4" />
          <circle cx="18" cy="13" r="2.5" />
        </svg>
      )
    }
  ] : [];

  const renderPlanCard = (card, index) => {
    const colors = colorClasses[card.color];
    return (
      <div
        key={index}
        className={`${colors.bg} rounded-lg p-4 glow-border hover:scale-105 transition-transform duration-200 relative overflow-hidden`}
      >
        <div className={`absolute top-0 right-0 w-20 h-20 ${colors.bg} rounded-full blur-2xl opacity-30`}></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs ${colors.textLight} font-medium`}>
              {card.label}
            </p>
            <div className={colors.icon}>
              {card.icon}
            </div>
          </div>
          <p className={`text-xl font-bold ${colors.text}`}>
            {card.value}
          </p>
        </div>
      </div>
    );
  };

  // Create referral links from username
  const { leftRefLink, rightRefLink } = useMemo(() => {
    const baseUrl = window.location.origin;
    const username = plan?.username || user?.username || '';
    
    // If no username, use email as fallback or leave empty
    const refCode = username || user?.email?.split('@')[0] || '';
    
    const leftLink = refCode 
      ? `${baseUrl}/register?ref=${encodeURIComponent(refCode)}&position=left`
      : `${baseUrl}/register?position=left`;
    
    const rightLink = refCode 
      ? `${baseUrl}/register?ref=${encodeURIComponent(refCode)}&position=right`
      : `${baseUrl}/register?position=right`;
    
    return {
      leftRefLink: leftLink,
      rightRefLink: rightLink
    };
  }, [plan?.username, user?.username, user?.email]);

  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 md:p-6 glow-border glow-border-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-emerald-300 dark:text-emerald-400">
          Plan Information
        </h2>
        {planLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-400"></div>
        )}
      </div>
      {planLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        </div>
      ) : plan ? (
        <div className="space-y-4">
          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planCards.map((card, index) => renderPlanCard(card, index))}
          </div>

          {/* Ref Link Section */}
          <ReflinkSection 
            leftRefLink={leftRefLink} 
            rightRefLink={rightRefLink} 
          />
        </div>
      ) : (
        <div className="text-center py-12 text-emerald-300/80">
          No plan information available
        </div>
      )}
    </div>
  );
}

export default PlanInformation;

