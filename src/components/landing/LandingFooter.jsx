import { Link } from 'react-router-dom';

function LandingFooter() {
  return (
    <footer className="bg-slate-800 dark:bg-slate-900 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center">
          <div className="mb-8">
            <ul className="flex flex-wrap justify-center gap-6 mb-6">
              <li>
                <a
                  href="#home"
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  Terms of use
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-white">© 2025 Novaxisgreen. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;

