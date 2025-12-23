import { useEffect, useMemo, useState } from 'react';
import BalanceSection from '../components/BalanceSection';
import BannerCarousel from '../components/BannerCarousel';
import CommissionStats from '../components/CommissionStats';
import InviteFriendsCard from '../components/InviteFriendsCard';
import PlanCard from '../components/PlanCard';
import QuickActions from '../components/QuickActions';
import ReflinkSection from '../components/ReflinkSection';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import { bannerImages, quickActions } from '../data/dashboardData';
import api from '../services/api';

function Dashboard() {
  const [showReflinks, setShowReflinks] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch ALL statistics with SINGLE API call
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.USER.STATISTIC);
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        setError(response.message || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('[Dashboard] Fetch statistics error:', err);
      setError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    // Fetch ngay lập tức
    if (isMounted) {
      fetchStatistics();
    }

    // Refresh every 1 minute
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchStatistics();
      }
    }, 60000);

    // Refresh khi window focus
    const handleFocus = () => {
      if (isMounted) {
        fetchStatistics();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Create dynamic referral links từ reflinks API response
  const { leftRefLink, rightRefLink } = useMemo(() => {
    const baseUrl = window.location.origin;
    
    if (statistics?.reflinks) {
      const leftCode = statistics.reflinks.leftRefCode || '';
      const rightCode = statistics.reflinks.rightRefCode || '';
      
      return {
        leftRefLink: leftCode ? `${baseUrl}/register?ref=${encodeURIComponent(leftCode)}` : '',
        rightRefLink: rightCode ? `${baseUrl}/register?ref=${encodeURIComponent(rightCode)}` : ''
      };
    }
    
    return {
      leftRefLink: '',
      rightRefLink: ''
    };
  }, [statistics]);

  // Data cho các components
  const planData = statistics?.plan ? {
    userRank: statistics.plan.userRank || '—',
    leaderRank: statistics.plan.leaderRank || '-',
    totalInvestment: statistics.plan.totalInvestment || 0,
    totalDirectMember: statistics.plan.totalDirectMember || 0,
    totalSalesFromDirect: statistics.plan.totalSalesFromDirect || 0,
    maxoutRemaining: statistics.plan.maxoutRemaining || 0,
    totalMaxout: statistics.plan.totalMaxout || 0,
    currency: statistics.plan.currency || 'USDT'
  } : {
    userRank: '—',
    totalInvestment: 0,
    totalDirectMember: 0,
    totalSalesFromDirect: 0,
    maxoutRemaining: 0,
    totalMaxout: 0,
    currency: 'USDT'
  };

  const balanceData = statistics?.balance ? {
    usdtBalance: statistics.balance.usdtBalance || 0,
    novaBalance: statistics.balance.novaBalance || 0,
    novaValueInUsdt: statistics.balance.novaValueInUsdt || 0,
    dailyBalance: statistics.balance.dailyBalance || 0,
    totalCommission: statistics.balance.totalCommission || 0,
    currency: statistics.balance.currency || 'USDT'
  } : {
    usdtBalance: 0,
    novaBalance: 0,
    novaValueInUsdt: 0,
    dailyBalance: 0,
    totalCommission: 0,
    currency: 'USDT'
  };

  const commissionData = statistics?.commissions ? {
    directCommission: statistics.commissions.directCommission || 0,
    binaryCommission: statistics.commissions.binaryCommission || 0,
    leaderCommission: statistics.commissions.leaderCommission || 0,
    popCommission: statistics.commissions.popCommission || 0,
    currency: statistics.commissions.currency || 'USDT'
  } : {
    directCommission: 0,
    binaryCommission: 0,
    leaderCommission: 0,
    popCommission: 0,
    currency: 'USDT'
  };

  const novaPrice = statistics?.novaPrice || 0.1;

  // Loading state
  if (loading && !statistics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !statistics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-200 text-lg mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Carousel Section - Full width on desktop */}
      <div className="hidden md:block w-full">
        <BannerCarousel images={bannerImages} />
      </div>

      {/* Container chính */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Carousel Section - Mobile only */}
        <div className="md:hidden">
          <BannerCarousel images={bannerImages} />
        </div>

        {/* Quick Actions Grid - Mobile only */}
        <div className="md:hidden">
          <QuickActions actions={quickActions} />
        </div>

        {/* Action Card - Mời bạn bè */}
        <InviteFriendsCard onClick={() => setShowReflinks(!showReflinks)} />

        {/* Reflink Section */}
        {showReflinks && (
          <ReflinkSection 
            leftRefLink={leftRefLink} 
            rightRefLink={rightRefLink} 
          />
        )}

        {/* Plan Card */}
        <PlanCard 
          plan={planData}
          loading={loading}
          onRefresh={fetchStatistics}
        />

        {/* Balance Section */}
        <BalanceSection 
          balance={balanceData}
          loading={loading}
        />

        {/* Commission Statistics */}
        <CommissionStats 
          commissions={commissionData}
          currency={balanceData.currency}
        />

        {/* NOVA Token Information */}
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 md:p-6 glow-border flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300">
              NOVA Token Information
            </h3>
            <p className="text-2xl font-bold text-white">
              1 NOVA = {novaPrice.toFixed(2).replace('.', ',')} USDT
            </p>
            <p className="text-sm text-gray-300 break-all">
              Smart Contract:{' '}
              <a
                href="https://bscscan.com/address/0xb3f338b391eb018CccA92d4AC8c8dD235632f6E5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline hover:text-emerald-200"
              >
                0xb3f338b391eb018CccA92d4AC8c8dD235632f6E5
              </a>
            </p>
          </div>
          <div className="w-full md:w-52 lg:w-56 xl:w-64 max-w-xs md:max-w-sm">
            <img
              src="https://res.cloudinary.com/dijayprrw/image/upload/v1765541069/Screenshot_2025-12-12_190406_mfq9kr.png"
              alt="NOVA Token"
              className="w-full h-auto rounded-lg shadow-lg border border-emerald-500/40"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;