import React from 'react';

// Quick Actions Data
export const quickActions = [
  { 
    name: 'Invest', 
    path: '/invest', 
    color: 'bg-green-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    )
  },
  { 
    name: 'Swap', 
    path: '/swap', 
    color: 'bg-orange-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    )
  },
  { 
    name: 'Transfer', 
    path: '/transfer', 
    color: 'bg-blue-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    )
  },
  { 
    name: 'Binary Tree', 
    path: '/binary-tree', 
    color: 'bg-red-500',
    icon: (
      <>
        {/* Root node */}
        <circle cx="12" cy="4" r="2" fill="currentColor" />
        {/* Branches from root */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6L6 10M12 6L18 10" fill="none" />
        {/* Level 2 nodes */}
        <circle cx="6" cy="12" r="2" fill="currentColor" />
        <circle cx="18" cy="12" r="2" fill="currentColor" />
        {/* Branches from level 2 */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14L3 18M6 14L9 18M18 14L15 18M18 14L21 18" fill="none" />
        {/* Level 3 nodes */}
        <circle cx="3" cy="20" r="1.5" fill="currentColor" />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
        <circle cx="15" cy="20" r="1.5" fill="currentColor" />
        <circle cx="21" cy="20" r="1.5" fill="currentColor" />
      </>
    )
  },
  { 
    name: 'Deposit', 
    path: '/deposit', 
    color: 'bg-green-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    )
  },
  { 
    name: 'Withdraw', 
    path: '/withdraw', 
    color: 'bg-orange-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    )
  }
];

// Banner Images
export const bannerImages = [
  'https://res.cloudinary.com/dijayprrw/image/upload/v1765567513/Screenshot_2025-12-13_022455_ybi7o9.png',
  'https://res.cloudinary.com/dijayprrw/image/upload/v1765567568/Screenshot_2025-12-13_022551_owmrsk.png',
  'https://res.cloudinary.com/dijayprrw/image/upload/v1765567623/Screenshot_2025-12-13_022651_br0ual.png'
];

