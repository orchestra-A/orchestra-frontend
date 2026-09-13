import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingAIChat } from '../FloatingAIChat';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Link2, X } from 'lucide-react';
import { Button } from '../ui/button';

// Main layout wrapper for the authenticated application.
// Handles the positioning of the Sidebar, Header, and the main scrollable content area (<Outlet />).
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHoveringSidebar, setIsHoveringsidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loading: dataLoading } = useProject();
  const { currentUser } = useAuth();
  const [navLoading, setNavLoading] = useState(false);

  const [pendingLinkPlatform, setPendingLinkPlatform] = useState(null);

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

  // Check for pending platform link
  useEffect(() => {
    if (!currentUser) return;
    const pending = sessionStorage.getItem('pending_link_platform');
    if (pending) {
      const connected = Array.isArray(currentUser.platforms_connected) ? currentUser.platforms_connected : [];
      if (!connected.includes(pending)) {
        setPendingLinkPlatform(pending);
      } else {
        sessionStorage.removeItem('pending_link_platform');
        setPendingLinkPlatform(null);
      }
    }
  }, [currentUser]);

  const handleLinkPlatform = () => {
    if (!currentUser?.id || !pendingLinkPlatform) return;
    const url = `https://orchestra-backend-30fy.onrender.com/auth/${pendingLinkPlatform}?user_id=${currentUser.id}`;
    sessionStorage.removeItem('pending_link_platform');
    window.location.href = url;
  };

  const handleDismissLink = () => {
    sessionStorage.removeItem('pending_link_platform');
    setPendingLinkPlatform(null);
  };

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
            <Outlet context={{ isLoading }} />
          </main>

          {showChat && <FloatingAIChat />}
        </div>
      </div>

      {/* Pending Platform Link Modal */}
      {pendingLinkPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#27272A] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scale-in">
            <button 
              onClick={handleDismissLink}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-center w-12 h-12 bg-[#eef5eb] dark:bg-[#eef5eb]/10 rounded-full mb-4">
              <Link2 className="text-[#5b7a50]" size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#1c1c1a] dark:text-white mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Link your {pendingLinkPlatform.charAt(0).toUpperCase() + pendingLinkPlatform.slice(1)} Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              We noticed you originally tried to log in using <strong>{pendingLinkPlatform}</strong>. Would you like to link that platform to your <strong>{currentUser?.username || 'current'}</strong> account now?
            </p>
            <div className="flex space-x-3">
              <Button onClick={handleDismissLink} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 border-none shadow-none">
                No thanks
              </Button>
              <Button onClick={handleLinkPlatform} className="flex-1 bg-[#2d4025] hover:bg-[#3d5732] text-white">
                Yes, Link Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
