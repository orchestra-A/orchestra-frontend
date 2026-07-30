import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingAIChat } from '../FloatingAIChat';
import { useProject } from '../../context/ProjectContext';
import { Loader2 } from 'lucide-react';

// Main layout wrapper for the authenticated application.
// Handles the positioning of the Sidebar, Header, and the main scrollable content area (<Outlet />).
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHoveringSidebar, setIsHoveringsidebar] = useState(false);
  const location = useLocation();
  const { loading: dataLoading } = useProject();
  const [navLoading, setNavLoading] = useState(false);

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

        {/* Loading Progress Bar directly below top bar (Header) */}
        {isLoading && (
          <div className="w-full h-1 bg-[#6B905F]/20 overflow-hidden shrink-0">
            <div className="h-full bg-[#6B905F] animate-pulse w-full origin-left transition-all duration-300" />
          </div>
        )}
        
        <div className="flex-1 flex overflow-hidden relative">
          <main key={location.pathname} className="flex-1 p-4 overflow-auto animate-fade-in-up">
            <Outlet />
          </main>
          
          {showChat && <FloatingAIChat />}
        </div>
      </div>
    </div>
  );
}
