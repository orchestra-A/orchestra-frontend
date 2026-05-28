import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/projects') return 'Projects';
  if (pathname === '/team') return 'Team';
  if (pathname === '/settings') return 'Settings';
  return 'Clover AI';
};

export function Header({ onMenuClick }) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-header-height shrink-0 bg-surface border-b border-border flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-primary rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="font-semibold text-lg text-text-primary">
          {pageTitle}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-medium hover:bg-brand-dark cursor-pointer transition-colors duration-200">
        IM
      </div>
    </header>
  );
}
