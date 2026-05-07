import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderKanban, CheckSquare, Users, X, Loader2, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchApi, SearchResult } from '../../api/search';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchPalette = ({ isOpen, onClose }: SearchPaletteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);

  const flatResults = useCallback(() => {
    if (!results) return [];
    return [
      ...results.projects.map(p => ({ ...p, type: 'project' })),
      ...results.tasks.map(t => ({ ...t, type: 'task' })),
      ...results.users.map(u => ({ ...u, type: 'user' })),
    ];
  }, [results]);

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const data = await searchApi.query(debouncedQuery);
        setResults(data.results);
        setActiveIndex(0);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };
    handleSearch();
  }, [debouncedQuery]);

  const handleNavigate = (item: any) => {
    onClose();
    setQuery('');
    if (item.type === 'project') navigate(`/projects/${item.id}`);
    if (item.type === 'task') navigate(`/projects/${item.projectId}`);
    if (item.type === 'user') navigate(`/team`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      const items = flatResults();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter' && items[activeIndex]) {
        handleNavigate(items[activeIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, flatResults, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl z-[101] overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
              <Search className="text-slate-400" size={20} />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tasks, or team members..."
                className="bg-transparent text-white text-lg outline-none flex-1 placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1.5">
                {loading ? (
                  <Loader2 className="text-indigo-400 animate-spin" size={18} />
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-400 font-bold">
                    ESC
                  </div>
                )}
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
              {query.length < 2 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Command size={40} className="opacity-20" />
                  <p className="text-sm">Type at least 2 characters to search...</p>
                </div>
              ) : results && (results.projects.length > 0 || results.tasks.length > 0 || results.users.length > 0) ? (
                <div className="space-y-4 py-2">
                  {results.projects.length > 0 && (
                    <Section title="Projects" icon={FolderKanban}>
                      {results.projects.map((p, i) => (
                        <ResultItem
                          key={p.id}
                          active={activeIndex === i}
                          onClick={() => handleNavigate({ ...p, type: 'project' })}
                          onHover={() => setActiveIndex(i)}
                        >
                          {p.title}
                        </ResultItem>
                      ))}
                    </Section>
                  )}
                  {results.tasks.length > 0 && (
                    <Section title="Tasks" icon={CheckSquare}>
                      {results.tasks.map((t, i) => (
                        <ResultItem
                          key={t.id}
                          active={activeIndex === results.projects.length + i}
                          onClick={() => handleNavigate({ ...t, type: 'task' })}
                          onHover={() => setActiveIndex(results.projects.length + i)}
                        >
                          {t.title}
                        </ResultItem>
                      ))}
                    </Section>
                  )}
                  {results.users.length > 0 && (
                    <Section title="Team Members" icon={Users}>
                      {results.users.map((u, i) => (
                        <ResultItem
                          key={u.id}
                          active={activeIndex === results.projects.length + results.tasks.length + i}
                          onClick={() => handleNavigate({ ...u, type: 'user' })}
                          onHover={() => setActiveIndex(results.projects.length + results.tasks.length + i)}
                        >
                          <div className="flex flex-col">
                            <span>{u.name}</span>
                            <span className="text-[10px] text-slate-500">{u.email}</span>
                          </div>
                        </ResultItem>
                      ))}
                    </Section>
                  )}
                </div>
              ) : !loading && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <p className="text-sm">No results found for "{query}"</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded">↵</span> Select</span>
                <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded">↑↓</span> Navigate</span>
              </div>
              <span>Global Command Palette</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Section = ({ title, icon: Icon, children }: any) => (
  <div className="space-y-1">
    <div className="px-3 flex items-center gap-2 py-1">
      <Icon size={12} className="text-slate-500" />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const ResultItem = ({ children, active, onClick, onHover }: any) => (
  <button
    onClick={onClick}
    onMouseEnter={onHover}
    className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
    }`}
  >
    {children}
  </button>
);

export default SearchPalette;
