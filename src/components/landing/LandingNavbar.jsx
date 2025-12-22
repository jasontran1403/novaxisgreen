import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/Logo.png';

function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#vision', label: 'Vision & Mission' },
    { href: '#ecosystem', label: 'Ecosystem' },
    { href: '#novachain', label: 'Novaxis Chain' },
    { href: '#roadmap', label: 'Roadmap' },
    { href: '#team', label: 'Competitive Advantages' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <img
              src={Logo}
              alt="Novaxis Logo"
              className="h-24 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white hover:text-cyan-400 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/register"
              className="text-white hover:text-cyan-400 transition-colors duration-200"
            >
              SignUp
            </Link>
            <Link
              to="/login"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              SignIn
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="mdi mdi-menu"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-white hover:text-cyan-400 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/register"
              className="block text-white hover:text-cyan-400 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              SignUp
            </Link>
            <Link
              to="/login"
              className="block bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              SignIn
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default LandingNavbar;

