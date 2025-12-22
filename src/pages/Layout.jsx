import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const userName = user?.username || user?.Username || user?.name || user?.hoTen || 'User';
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-600 dark:bg-gray-900 dotted-bg">
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

