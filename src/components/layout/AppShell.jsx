import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingAIChat } from '../FloatingAIChat';
import { useProject } from '../../context/ProjectContext';
import { Loader2 } from 'lucide-react';

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full h-full p-2 animate-pulse">
      {/* Top Header/Title area */}
      <div className="w-48 h-8 bg-gray-200 dark:bg-[#27272A] rounded-lg"></div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-4">
          <div className="w-full h-32 bg-gray-200 dark:bg-[#27272A] rounded-xl"></div>
          <div className="w-full h-64 bg-gray-200 dark:bg-[#27272A] rounded-xl"></div>
        </div>
        <div className="col-span-1 lg:col-span-2 bg-gray-200 dark:bg-[#27272A] rounded-xl h-[500px]"></div>
      </div>
    </div>
  );
}

// Main layout wrapper for the authenticated application.
// Handles the positioning of the Sidebar, Header, and the main scrollable content area (<Outlet />).
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHoveringSidebar, setIsHoveringsidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loading: dataLoading } = useProject();
  const [navLoading, setNavLoading] = useState(false);

  // Redirect to home page on manual browser refresh
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, []);

  // Trigger a loading animation on route transition
  useEffect(() => {
    setNavLoading(true);
    const timer = setTimeout(() => setNavLoading(false), 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLoading = dataLoading || navLoading;

  // Routes where the AI chat should be hidden
  const hiddenChatRoutes = ['/profile', '/settings', '/help', '/about', '/blueprint'];
  const showChat = !hiddenChatRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="size-full flex bg-[#F5F6F8] dark:bg-[#18181B] h-screen overflow-hidden relative">
      <Sidebar 
        sidebarCollapsed={sidebarCollapsed} 
        setSidebarCollapsed={setSidebarCollapsed}
        isHoveringSidebar={isHoveringSidebar}
        setIsHoveringsidebar={setIsHoveringsidebar}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        
        <div className="flex-1 flex overflow-hidden relative">
          <main key={location.pathname} className="flex-1 p-4 overflow-auto animate-fade-in-up">
            {isLoading ? <PageSkeleton /> : <Outlet />}
          </main>
          
          {showChat && <FloatingAIChat />}
        </div>
      </div>
    </div>
  );
}
