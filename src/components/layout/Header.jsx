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

export function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return "G";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-16 bg-white px-6 flex items-center justify-between border-b border-gray-200 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search projects, tasks..."
          className="w-full pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#4A90E2]/30 focus-visible:border-[#4A90E2]/30 h-9"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white shadow-sm h-9 px-4 cursor-pointer"
        >
          New Project
        </Button>

        <button className="relative p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
          <Bell className="w-[18px] h-[18px] text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E74C3C] rounded-full"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none cursor-pointer">
              <Avatar className="w-8 h-8 border border-gray-200 hover:border-[#4A90E2] transition-colors cursor-pointer">
                <AvatarFallback className="bg-[#4A90E2] text-white text-xs">
                  {getInitials(currentUser?.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser?.name || "Guest User"}</span>
                <span className="text-xs text-gray-500 font-normal">{currentUser?.email || "guest@clover.app"}</span>
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
