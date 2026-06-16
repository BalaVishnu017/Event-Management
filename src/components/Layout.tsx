import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Cloud,
  Menu,
  X,
  LogOut,
  PlusCircle,
  History,
  LayoutDashboard,
  Sun,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create', label: 'New Event', icon: PlusCircle },
    { path: '/past-events', label: 'Past Events', icon: History },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-teal flex items-center justify-center shadow-glow-brand"
              >
                <Sun size={18} className="text-white" />
              </motion.div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-white tracking-tight">Sky</span>
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  <Cloud size={16} className="text-brand-400" />
                </motion.div>
                <span className="text-lg font-bold text-gradient">Cal</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* User / Logout */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/60 border border-surface-700/40">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-surface-300 font-medium max-w-[120px] truncate">
                      {user.displayName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/60 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-surface-800/60 bg-surface-900/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.path)
                          ? 'text-brand-400 bg-brand-500/10'
                          : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
                {user && (
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-800/60 bg-surface-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <CalendarDays size={14} />
            <span>© {new Date().getFullYear()} SkyCal — Smart Event Planner</span>
          </div>
          <div className="flex gap-6 text-xs text-surface-600">
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;