import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useEffect } from 'react';
import SearchPalette from '../search/SearchPalette';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user } = useAuth();
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 glassmorphism border-b border-slate-700/50 flex items-center justify-between px-4 md:px-6 z-30 sticky top-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
        >
          <Search size={15} />
          <span>Search...</span>
          <kbd className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => toast.info('No new notifications')}
          className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#0F172A]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-white text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      <SearchPalette isOpen={searchPaletteOpen} onClose={() => setSearchPaletteOpen(false)} />
    </header>
  );
};

export default Navbar;
