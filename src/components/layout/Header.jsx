import { Search, Bell, User, Settings, HelpCircle, LogOut, ChevronRight, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

// Global Top Navigation Bar
// Contains global search, quick-action buttons (like Blueprint), notifications, and the user profile dropdown.
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { projects } = useProject();

  const [showMissingPopup, setShowMissingPopup] = useState(false);
  const isMissingPlatforms = currentUser && (!currentUser.github_username || !currentUser.discord_id);

  useEffect(() => {
    if (isMissingPlatforms && !sessionStorage.getItem('workspacesPrompted')) {
      setShowMissingPopup(true);
      sessionStorage.setItem('workspacesPrompted', 'true');
    }
  }, [isMissingPlatforms]);

  // Clears the current user session and redirects to login (handled by PublicRoute logic)

  const handleLogout = () => {
    logout();
  };

  const getInitials = (user) => {
    const name = user?.username || user?.name;
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0) return null;

    if (pathParts[0] === 'project' && pathParts.length >= 2) {
      const projectId = pathParts[1];
      const project = projects.find(p => p.id === projectId || p.id === decodeURIComponent(projectId));
      const section = pathParts[2] ? (pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1)) : 'Overview';
      
      return (
        <div className="flex items-center gap-2 text-sm mr-6 hidden md:flex">
          <span onClick={() => navigate('/')} className="text-gray-500 dark:text-white/50 hover:text-[#1D1E1B] dark:hover:text-white cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
          <span className="text-[#1D1E1B] dark:text-white/90 font-medium truncate max-w-[150px]">{project ? project.name : 'Project'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
          <span className="text-gray-500 dark:text-white/50">{section}</span>
        </div>
      );
    }
    
    // For other root pages
    const pageName = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);
    return (
      <div className="flex items-center gap-2 text-sm mr-6 hidden md:flex">
        <span onClick={() => navigate('/')} className="text-gray-500 dark:text-white/50 hover:text-[#1D1E1B] dark:hover:text-white cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
        <span className="text-[#1D1E1B] dark:text-white/90 font-medium">{pageName}</span>
      </div>
    );
  };

  return (
    <div className="h-16 bg-[#F4F1EB] dark:bg-[#09090B] px-6 flex items-center justify-between border-b border-gray-200 dark:border-[#27272A] shrink-0">
      
      <div className="flex items-center flex-1">
        {getBreadcrumbs()}
        

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => navigate('/blueprint')}
          className="bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white shadow-sm h-9 px-4 cursor-pointer"
        >
          New Project
        </Button>

        <div className="relative">
          <button 
            onClick={() => navigate('/profile', { state: { activeTab: 'platform' } })}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#2B3B26] rounded-md transition-colors cursor-pointer"
          >
            <Bell className="w-[18px] h-[18px] text-gray-600 dark:text-white/70" />
            {isMissingPlatforms && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E74C3C] rounded-full shadow-[0_0_0_2px_#F4F1EB] dark:shadow-[0_0_0_2px_#09090B]"></span>
            )}
          </button>
          
          {showMissingPopup && (
            <div className="absolute top-12 right-0 z-50 bg-white dark:bg-[#1D1E1B] border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl p-4 w-72 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Action Required</h3>
                <button 
                  onClick={() => setShowMissingPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                You haven't connected all your workspaces yet. Connect GitHub and Discord to unlock automatic activity tracking.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setShowMissingPopup(false);
                  navigate('/profile', { state: { activeTab: 'platform' } });
                }}
                className="w-full bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#5A7A4F] text-white cursor-pointer"
              >
                Connect Workspaces
              </Button>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none cursor-pointer">
              <Avatar className="w-8 h-8 border border-gray-200 dark:border-[#27272A] hover:border-[#6B905F] dark:border-[#6B905F] dark:hover:border-[#6B905F] dark:border-[#6B905F] transition-colors cursor-pointer">
                <AvatarFallback className="bg-[#6B905F] dark:bg-[#6B905F] text-white text-xs">
                  {getInitials(currentUser)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 dark:bg-[#09090B] dark:border-[#27272A]">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium dark:text-white/90">{currentUser?.username || currentUser?.name || 'Guest User'}</span>
                <span className="text-xs text-gray-500 dark:text-white/50 font-normal">{currentUser?.email || ''}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')} className="cursor-pointer">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Help & About</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
