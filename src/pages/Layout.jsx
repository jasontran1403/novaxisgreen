import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';

const Layout = ({ children }) => {
  const { user, updateUser } = useAuth();
  const userName = user?.username || user?.Username || user?.name || user?.hoTen || 'User';
  
  // ✅ Global password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(true);

  // ✅ Check if user is impersonating
  const isImpersonated = () => {
    const isImpersonated = localStorage.getItem('isImpersonated');
    return isImpersonated === 'true';
  };

  // ✅ Check password status on mount (global)
  useEffect(() => {
    const checkPasswordStatus = async () => {
      // ✅ Skip if impersonating
      if (isImpersonated()) {
        setCheckingPassword(false);
        return;
      }

      try {
        setCheckingPassword(true);
        const response = await api.get(API_ENDPOINTS.USER.PASSWORD_STATUS);

        if (response.success) {
          const passwordChanged = response.data; // true/false
          const needsPasswordChange = !passwordChanged;
          if (needsPasswordChange) {
            setShowPasswordModal(true);
          }
        }
      } catch (err) {
        console.error('[Layout] Error checking password status:', err);
      } finally {
        setCheckingPassword(false);
      }
    };

    checkPasswordStatus();
  }, []); // Only run once on mount

  // ✅ Handle password change success
  const handlePasswordChangeSuccess = () => {
    console.log('[Layout] Password changed successfully');
    setShowPasswordModal(false);

    // Update user context
    if (updateUser) {
      updateUser({
        requirePasswordChange: false
      });
    }
  };

  // ✅ Handle modal close - block if required
  const handleModalClose = () => {
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-600 dark:bg-gray-900 dotted-bg">
      {/* ✅ Global Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={handleModalClose}
        onSuccess={handlePasswordChangeSuccess}
      />

      <div className="flex flex-col min-h-screen relative z-10">
        {/* Header - Desktop ở top, Mobile có top bar và bottom nav */}
        <Header userName={userName} />

        {/* Main Content - có padding để tránh bị che bởi fixed header/footer */}
        <main className="flex-1 pt-14 md:pt-16 pb-24 md:pb-6" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </main>

        {/* Footer - chỉ hiển thị trên desktop */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;