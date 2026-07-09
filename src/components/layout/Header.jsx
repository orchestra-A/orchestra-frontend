import { Search, Bell, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// Global Top Navigation Bar
// Contains global search, quick-action buttons (like Blueprint), notifications, and the user profile dropdown.
export function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Clears the current user session and redirects to login (handled by PublicRoute logic)

  const handleLogout = () => {
    logout();
  };

  const getInitials = (user) => {
    const name = user?.username || user?.name;
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-16 bg-[#F4F1EB] dark:bg-[#09090B] px-6 flex items-center justify-between border-b border-gray-200 dark:border-[#27272A] shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
        <Input
          placeholder="Search projects, tasks..."
          className="w-full pl-10 bg-[#F3F7F1] dark:bg-[#18181B] border-gray-200 dark:border-[#27272A] text-[#1D1E1B] dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-[#6B905F] dark:ring-[#6B905F]/30 focus-visible:border-[#6B905F] dark:border-[#6B905F]/30 h-9"
        />
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

        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#2B3B26] rounded-md transition-colors cursor-pointer">
          <Bell className="w-[18px] h-[18px] text-gray-600 dark:text-white/70" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E74C3C] rounded-full"></span>
        </button>

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
