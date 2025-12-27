import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/members', label: 'Member Management', icon: '👥' },
    { path: '/admin/investments', label: 'Investment Management', icon: '💼' },
    { path: '/admin/binary-tree', label: 'Binary Tree', icon: '🌳' },
    { path: '/admin/deposits', label: 'Deposit Management', icon: '💰' },
    { path: '/admin/withdraws', label: 'Withdraw Management', icon: '💸' },
    { path: '/admin/commission-settings', label: 'Commission Settings', icon: '⚙️' },
    { path: '/admin/settings', label: 'Settings', icon: '🔧' },
    { path: '/admin/wallet-config', label: 'Wallet Config', icon: '🔐' },
    { path: '/admin/reset-rebuild', label: 'Reset & Rebuild', icon: '🔄' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen && !isMobile ? 'w-64' : sidebarOpen && isMobile ? 'w-64' : 'w-20'}
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col
      `}>
        {/* Logo/Header */}
        <div className="p-3 sm:p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-lg sm:text-xl font-bold text-emerald-400">Admin Panel</h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 sm:p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-emerald-400'
              }`}
            >
              <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-2 sm:p-4 border-t border-slate-700">
          {sidebarOpen && (
            <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-slate-400">
              <div className="font-medium text-emerald-400 truncate">{user?.name || user?.hoTen || 'Admin'}</div>
              <div className="text-xs truncate">{user?.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <span className="text-lg sm:text-xl flex-shrink-0">🚪</span>
            {sidebarOpen && <span className="text-xs sm:text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-base sm:text-lg font-semibold text-emerald-400 truncate">
                {menuItems.find(item => isActive(item.path))?.label || 'Admin Dashboard'}
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

