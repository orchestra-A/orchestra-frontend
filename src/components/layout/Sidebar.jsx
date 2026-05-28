import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-sidebar-width bg-sidebar-bg text-sidebar-text transform transition-transform duration-300 ease-in-out md:transform-none flex flex-col h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-header-height shrink-0 flex items-center px-6 border-b border-white/10 font-bold text-xl text-white tracking-tight">
          Clover AI
        </div>
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-brand text-white border-l-2 border-white' : 'text-sidebar-text hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
