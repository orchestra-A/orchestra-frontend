import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHoveringSidebar, setIsHoveringsidebar] = useState(false);

  return (
    <div className="size-full flex bg-[#F5F6F8] dark:bg-[#383B40] h-screen overflow-hidden">
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
