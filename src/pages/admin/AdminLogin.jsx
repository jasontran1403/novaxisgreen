import { useEffect } from 'react';
import AdminLoginForm from '../../components/AdminLoginForm';
import AuthHeader from '../../components/AuthHeader';
import { useAuth } from '../../contexts/AuthContext';

function AdminLogin() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Nếu đã đăng nhập và là admin, redirect đến admin dashboard
    if (isAuthenticated) {
      const isAdmin = user?.isAdmin === true || user?.IsAdmin === true || user?.IsAdmin === 1;
      if (isAdmin) {
        window.location.href = '/admin/dashboard';
      }
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader 
          title="Admin Login"
          subtitle="Đăng nhập vào hệ thống quản trị"
        />
        <AdminLoginForm />
      </div>
    </div>
  );
}

export default AdminLogin;

