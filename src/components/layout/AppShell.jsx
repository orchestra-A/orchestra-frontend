import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Main layout wrapper for the authenticated application.
// Handles the positioning of the Sidebar, Header, and the main scrollable content area (<Outlet />).
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHoveringSidebar, setIsHoveringsidebar] = useState(false);

  return (
    <div className="size-full flex bg-[#F5F6F8] dark:bg-[#1C2618] h-screen overflow-hidden">
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
    </div>
  );
}
