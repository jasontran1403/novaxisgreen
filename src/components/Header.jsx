import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from './ConfirmModal';

const Header = ({ userName = 'User' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Check theme saved in localStorage or default to light
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // If not found, check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);

  // Initialize and update theme
  useEffect(() => {
    const root = document.documentElement;
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    // Force a reflow to ensure styles are applied
    void root.offsetHeight;
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      console.log('Toggling theme:', newValue ? 'dark' : 'light');
      // Update immediately
      const root = document.documentElement;
      if (newValue) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const reportMenuItems = [
    { name: 'Daily Interest', path: '/report/daily-interest' },
    { name: 'Direct Commission', path: '/report/direct-commission' },
    { name: 'Binary Commission', path: '/report/binary-commission' },
    { name: 'Leadership Commission', path: '/report/leadership-commission' },
    { name: 'POP', path: '/report/pop-commission' },
  ];

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      )
    },
    { 
      name: 'Report', 
      path: '/report', 
      hasDropdown: true,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )
    },
    { 
      name: 'Binary Tree', 
      path: '/binary-tree', 
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
      name: 'Invest', 
      path: '/invest', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    },
    { 
      name: 'Swap', 
      path: '/swap', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      )
    },
    { 
      name: 'Transfer', 
      path: '/transfer', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      )
    },
    { 
      name: 'Deposit', 
      path: '/deposit', 
      desktopOnly: true,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      )
    },
    { 
      name: 'Withdraw', 
      path: '/withdraw', 
      desktopOnly: true,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      )
    },
  ];

  // Header Top cho Desktop
  const HeaderTop = () => (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-slate-600 dark:bg-gray-900 dark:dotted-bg border-b-2 border-emerald-500 dark:border-emerald-400 glow-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo hoặc Brand */}
          <div className="flex-shrink-0">
            <img 
              src={Logo} 
              alt="Nova" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Navigation Items */}
          <nav className="flex space-x-1">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div 
                  key={item.name} 
                  className="relative" 
                  onMouseEnter={() => setIsReportDropdownOpen(true)} 
                  onMouseLeave={() => setIsReportDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md text-sm font-medium text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 transition-all flex items-center gap-1"
                  >
                    {item.name}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isReportDropdownOpen && (
                    <>
                      {/* Khoảng cách vô hình để giữ dropdown mở khi di chuyển chuột */}
                      <div className="absolute top-full left-0 w-full h-1" onMouseEnter={() => setIsReportDropdownOpen(true)}></div>
                      <div 
                        className="absolute top-full left-0 mt-1 w-56 bg-slate-600 dark:bg-gray-900 rounded-md shadow-lg border border-emerald-500/50 dark:border-emerald-400/50 z-[60]"
                        onMouseEnter={() => setIsReportDropdownOpen(true)}
                        onMouseLeave={() => setIsReportDropdownOpen(false)}
                      >
                        <div className="py-1">
                          {reportMenuItems.map((menuItem) => (
                            <Link
                              key={menuItem.path}
                              to={menuItem.path}
                              className="block px-4 py-2 text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 transition-all cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsReportDropdownOpen(false);
                              }}
                            >
                              {menuItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-3 py-2 rounded-md text-sm font-medium text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 transition-all"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Right Side: Welcome, Theme Toggle, Logout */}
          <div className="flex items-center space-x-4">
            {/* Welcome Message */}
            <div 
              onClick={() => navigate('/profile')}
              className="text-sm text-emerald-500 dark:text-emerald-400 cursor-pointer hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <span className="font-medium">Welcome, </span>
              <span className="font-semibold text-emerald-400 dark:text-emerald-300">{userName}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-emerald-500 dark:text-emerald-400 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 hover:text-emerald-400 dark:hover:text-emerald-300 transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-300 rounded-md transition-all font-bold border-2 border-emerald-300 hover:border-emerald-200 glow-border-hover"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // Header Bottom cho Mobile (Bottom Navigation Bar)
  const HeaderBottom = () => {
    const [activeItem, setActiveItem] = useState('');
    const [isReportMobileOpen, setIsReportMobileOpen] = useState(false);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isReportMobileOpen && !event.target.closest('.report-dropdown-mobile')) {
          setIsReportMobileOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isReportMobileOpen]);

    return (
      <>
        {/* Top bar cho mobile - chỉ hiển thị logo, welcome, theme và logout */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-600 dark:bg-gray-900 dark:dotted-bg border-b-2 border-emerald-500 dark:border-emerald-400 glow-border transition-all duration-300">
          <div className="px-4 relative z-10">
            <div className="flex justify-between items-center h-14">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={Logo} 
                  alt="Nova" 
                  className="h-8 w-auto object-contain"
                />
              </div>

              {/* Right Side: Welcome, Theme Toggle, Logout */}
              <div className="flex items-center space-x-2">
                {/* Welcome Message */}
                <div 
                  onClick={() => navigate('/profile')}
                  className="text-xs text-emerald-500 dark:text-emerald-400 cursor-pointer hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  <span className="font-medium">Welcome, </span>
                  <span className="font-semibold text-emerald-400 dark:text-emerald-300">{userName}</span>
                </div>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-emerald-500 dark:text-emerald-400 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 hover:text-emerald-400 dark:hover:text-emerald-300 transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </button>

                {/* Logout Button - icon only */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-emerald-500 dark:text-emerald-400 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 hover:text-emerald-400 dark:hover:text-emerald-300 transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  aria-label="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Bottom Navigation Bar cho mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-600 dark:bg-gray-900 dark:dotted-bg border-t-2 border-emerald-500 dark:border-emerald-400 glow-border transition-all duration-300 safe-area-inset-bottom">
          <div className="flex justify-around items-center h-16 relative z-10">
            {navItems.filter(item => !item.desktopOnly).map((item, index) => {
              const colors = [
                'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300',
                'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300',
                'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300',
                'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300',
                'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300',
                'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300',
              ];
              const activeColors = [
                'text-emerald-400 dark:text-emerald-300 bg-emerald-400/30 dark:bg-emerald-400/20',
                'text-emerald-400 dark:text-emerald-300 bg-emerald-400/30 dark:bg-emerald-400/20',
                'text-emerald-400 dark:text-emerald-300 bg-emerald-400/30 dark:bg-emerald-400/20',
                'text-emerald-400 dark:text-emerald-300 bg-emerald-400/30 dark:bg-emerald-400/20',
                'text-emerald-400 dark:text-emerald-300 bg-emerald-400/30 dark:bg-emerald-400/20',
                'text-emerald-400 dark:text-emerald-300 bg-emerald-400/30 dark:bg-emerald-400/20',
              ];
              const isActive = activeItem === item.path;
              
              if (item.hasDropdown) {
                return (
                  <div key={item.name} className="relative flex-1 report-dropdown-mobile">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsReportMobileOpen(!isReportMobileOpen);
                        setActiveItem(item.path);
                      }}
                      className={`flex flex-col items-center justify-center w-full h-full px-2 transition-all rounded-t-lg ${
                        isActive || isReportMobileOpen
                          ? `${activeColors[index % activeColors.length]}`
                          : `${colors[index % colors.length]}`
                      }`}
                    >
                      <svg
                        className="w-6 h-6 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {item.icon}
                      </svg>
                      <span className="text-xs font-medium truncate w-full text-center">{item.name}</span>
                    </button>
                    {isReportMobileOpen && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max min-w-[200px] max-w-[90vw] bg-slate-600 dark:bg-gray-900 rounded-md shadow-lg border border-emerald-500/50 dark:border-emerald-400/50 z-[60]">
                        <div className="py-1">
                          {reportMenuItems.map((menuItem) => (
                            <Link
                              key={menuItem.path}
                              to={menuItem.path}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsReportMobileOpen(false);
                                setActiveItem(menuItem.path);
                              }}
                              className="block px-4 py-2 text-xs text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-400/20 dark:hover:bg-emerald-400/10 transition-all cursor-pointer whitespace-nowrap"
                            >
                              {menuItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setActiveItem(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all rounded-t-lg ${
                    isActive
                      ? `${activeColors[index % activeColors.length]}`
                      : `${colors[index % colors.length]}`
                  }`}
                >
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {item.icon}
                  </svg>
                  <span className="text-xs font-medium truncate w-full text-center">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  };

  return (
    <>
      <HeaderTop />
      <HeaderBottom />
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
};

export default Header;
