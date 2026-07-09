import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingAIChat } from '../FloatingAIChat';

// Main layout wrapper for the authenticated application.
// Handles the positioning of the Sidebar, Header, and the main scrollable content area (<Outlet />).
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHoveringSidebar, setIsHoveringsidebar] = useState(false);
  const location = useLocation();
  
  // Routes where the AI chat should be hidden
  const hiddenChatRoutes = ['/profile', '/settings', '/help', '/about', '/blueprint'];
  const showChat = !hiddenChatRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="size-full flex bg-[#F5F6F8] dark:bg-[#18181B] h-screen overflow-hidden">
      <Sidebar 
        sidebarCollapsed={sidebarCollapsed} 
        setSidebarCollapsed={setSidebarCollapsed}
        isHoveringSidebar={isHoveringSidebar}
        setIsHoveringsidebar={setIsHoveringsidebar}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      {showChat && <FloatingAIChat />}
    </div>
  );
}
