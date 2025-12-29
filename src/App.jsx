import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BinaryTreeProvider } from './contexts/BinaryTreeContext'
import BinaryCommission from './pages/BinaryCommission'
import BinaryTree from './pages/BinaryTree'
import DailyInterest from './pages/DailyInterest'
import Dashboard from './pages/Dashboard'
import Deposit from './pages/Deposit'
import DirectCommission from './pages/DirectCommission'
import InterestProfit from './pages/InterestProfit'
import Invest from './pages/Invest'
import Layout from './pages/Layout'
import LeadershipCommission from './pages/LeadershipCommission'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import SalesNetwork from './pages/SalesNetwork'
import Swap from './pages/Swap'
import Transfer from './pages/Transfer'
import Withdraw from './pages/Withdraw'
import Profile from './pages/Profile'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import DepositManagement from './pages/admin/DepositManagement'
import MemberManagement from './pages/admin/MemberManagement'
import BinaryTreeAdmin from './pages/admin/BinaryTreeAdmin'
import CommissionSettings from './pages/admin/CommissionSettings'
import Settings from './pages/admin/Settings'
import ResetRebuild from './pages/admin/ResetRebuild'
import WalletConfig from './pages/admin/WalletConfig'
import WithdrawManagement from './pages/admin/WithdrawManagement'
import { ToastProvider } from './contexts/ToastProvider'
import InvestmentManagement from './pages/admin/InvestmentManagement'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/landing';
    return null;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = '/admin/login';
    return null;
  }

  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    window.location.href = '/admin/login';
    return null;
  }

  return children;
};

// Layout Wrapper Component
const LayoutWrapper = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Dashboard />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invest"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Invest />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/swap"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Swap />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transfer"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Transfer />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deposit"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Deposit />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/withdraw"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Withdraw />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/binary-tree"
              element={
                <ProtectedRoute>
                  <BinaryTreeProvider>
                    <LayoutWrapper>
                      <BinaryTree />
                    </LayoutWrapper>
                  </BinaryTreeProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/daily-interest"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <DailyInterest />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/interest-profit"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <InterestProfit />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/sales-network"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <SalesNetwork />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/direct-commission"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <DirectCommission />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/binary-commission"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <BinaryCommission />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/leadership-commission"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <LeadershipCommission />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/pop-commission"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <InterestProfit />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Profile />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <MemberManagement />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/investments"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <InvestmentManagement />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/binary-tree"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <BinaryTreeAdmin />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/deposits"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <DepositManagement />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/withdraws"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <WithdrawManagement />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/commission-settings"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <CommissionSettings />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/wallet-config"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <WalletConfig />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reset-rebuild"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ResetRebuild />
                  </AdminLayout>
                </AdminRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
