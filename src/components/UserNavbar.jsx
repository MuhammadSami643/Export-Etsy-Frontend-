import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { categoryApi, settingsApi } from '../api';

const UserNavbar = () => {
  const { cartCount, toggleCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [companyName, setCompanyName] = useState('VESTRA');
  const navigate = useNavigate();

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => { });
    settingsApi.getPublic().then(s => {
      if (s?.app_logo) setLogoUrl(s.app_logo);
      if (s?.company_name) setCompanyName(s.company_name);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0 flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-bold text-2xl tracking-[0.2em] text-ink transition-colors duration-300">{companyName.toUpperCase()}<span className="text-accent">.</span></span>
            )}
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-accent font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-accent font-medium transition-colors">Shop All</Link>
            <Link to="/about" className="text-gray-600 hover:text-accent font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-accent font-medium transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-5">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search apparel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 pl-10 pr-4 py-2 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-accent focus:ring-0 transition-all text-sm outline-none border text-gray-900"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
            </form>

            {isAdmin && (
              <Link to="/admin" title="Admin panel" className="text-gray-600 hover:text-accent transition-colors">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            )}

            {user ? (
              <Link to="/profile" title="Profile" className="text-gray-600 hover:text-accent transition-colors">
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/login" title="Sign in" className="text-gray-600 hover:text-accent transition-colors">
                <User className="h-5 w-5" />
              </Link>
            )}

            <button onClick={toggleCart} className="text-gray-600 hover:text-accent transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center md:hidden space-x-4">

            <button onClick={toggleCart} className="text-gray-700 relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-gray-900">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-4 shadow-lg absolute w-full">
          <form onSubmit={handleSearch} className="relative mt-2">
            <input
              type="text"
              placeholder="Search apparel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border-none outline-none"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </form>
          <div className="flex flex-col space-y-4 pt-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">Home</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">Shop All</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">About</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">Contact</Link>
            {user && (
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">My Orders</Link>
            )}
            {isAdmin && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">Admin Panel</Link>}
            {user ? (
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-left text-gray-800 font-medium text-lg">My Profile</Link>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default UserNavbar;
