import React, { useState, useEffect } from 'react';

const NovaxisWalletApp = () => {
  const [showToast, setShowToast] = useState(false);

  const handleAndroidDownload = () => {
    const link = document.createElement('a');
    link.href = '/nova.apk';
    link.download = 'Nova_Wallet.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIOSClick = () => {
    setShowToast(true);
  };

  // Tự động ẩn toast sau 3 giây
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <section className="py-20 bg-slate-950 border-t border-b border-slate-800 relative">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Novaxis Wallet Mobile App
        </h2>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Experience seamless crypto management on the go with our secure and intuitive mobile wallet.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {/* Android Button */}
          <button
            onClick={handleAndroidDownload}
            className="group flex items-center gap-4 bg-black hover:bg-emerald-600 transition-all duration-300 
                       border border-slate-700 hover:border-emerald-500 rounded-2xl px-8 py-5 w-full sm:w-auto"
          >
            <div className="text-4xl">🤖</div>
            <div className="text-left">
              <p className="text-xs text-slate-400">GET IT ON</p>
              <p className="text-2xl font-semibold text-white">Android</p>
              <p className="text-sm text-emerald-400 group-hover:text-white">Download APK</p>
            </div>
          </button>

          {/* iOS Button */}
          <button
            onClick={handleIOSClick}
            className="group flex items-center gap-4 bg-black hover:bg-slate-800 transition-all duration-300 
                       border border-slate-700 hover:border-slate-600 rounded-2xl px-8 py-5 w-full sm:w-auto"
          >
            <div className="text-4xl"></div>
            <div className="text-left">
              <p className="text-xs text-slate-400">COMING SOON ON</p>
              <p className="text-2xl font-semibold text-white">App Store</p>
              <p className="text-sm text-slate-500">iOS Version</p>
            </div>
          </button>
        </div>

        <p className="text-slate-500 text-sm mt-10">
          Android APK is available for download now • iOS version is under development
        </p>
      </div>

      {/* ==================== TOAST - GÓC PHẢI TRÊN ==================== */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[9999] max-w-xs w-full pointer-events-auto">
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden 
                       animate-slide-in-right"
          >
            <div className="flex items-start gap-4 p-5">
              {/* Icon Apple */}
              <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-700">
                <span className="text-3xl"></span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white flex items-center gap-2">
                  iOS Version
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <p className="text-slate-400 text-sm mt-1 leading-snug">
                  Novaxis Wallet for iPhone & iPad is currently under development.<br />
                  We will notify you as soon as it is available on the App Store.
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-emerald-500 w-full animate-progress"></div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        .animate-progress {
          animation: progress 3s linear forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease forwards;
        }
      `}</style>
    </section>
  );
};

export default NovaxisWalletApp;