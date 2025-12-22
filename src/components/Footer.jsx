const Footer = () => {
  return (
    <footer className="hidden md:block bg-slate-600 dark:bg-gray-900 dark:dotted-bg border-t-2 border-emerald-500 dark:border-emerald-400 glow-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-emerald-500 dark:text-emerald-400 mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Nova. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 transition-all"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 transition-all"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 transition-all"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

