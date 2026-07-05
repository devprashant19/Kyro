import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Settings, Compass, Blocks, ChevronDown } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

  const navLinks = [
    { name: 'Overview', path: '/app', icon: <Compass size={18} /> },
    { name: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Extension', path: '/app/extension', icon: <Blocks size={18} /> },
  ];

  return (
    <div className="h-screen w-full bg-slate-950 text-white flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between shadow-lg">
        
        {/* Left side: Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div 
            onClick={() => navigate('/app')}
            className="flex items-center gap-2.5 font-bold text-white text-xl tracking-tight cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="Kyro Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            Kyro
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/app'}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side: Profile & Mobile Toggle */}
        <div className="flex items-center gap-4">
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center border border-white/10 overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-zinc-300">{user?.fullName || 'User'}</span>
              <ChevronDown size={14} className={cn("text-zinc-500 transition-transform hidden sm:block", isProfileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <p className="font-semibold text-white">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/app/settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Settings size={16} className="text-zinc-500" />
                      Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-slate-950 border-b border-white/10 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/app'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                  )}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-0 relative flex flex-col overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
}
