import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import ProjectWorkflow from './pages/ProjectWorkflow';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Archive from './pages/Archive';
import Help from './pages/Help';
import ProjectTasks from './pages/ProjectTasks';
import ProjectTeam from './pages/ProjectTeam';
import ProjectActivity from './pages/ProjectActivity';
import Blueprint from './pages/Blueprint';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import OAuthCallback from './pages/OAuthCallback';

function GlobalLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log(`[App Action] Page Changed to: ${location.pathname}`);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      if (target) {
        const text = (target.innerText || target.title || target.className || 'Unknown Element').trim().substring(0, 50);
        console.log(`[App Action] Interacted with: ${text}`);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

// A wrapper to protect routes.
// - Unauthenticated users at "/" see the LandingPage.
// - Unauthenticated users at any other path get redirected to "/".
// - Authenticated but un-onboarded users get redirected to "/onboarding".
// - Authenticated and onboarded users see the route content.
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isOnboarded = localStorage.getItem('onboarded') === 'true';

  // Not logged in at all
  if (!currentUser) {
    // Show landing page at "/" instead of a blank screen
    if (location.pathname === '/') {
      return <LandingPage />;
    }
    // Any other protected path → redirect to landing
    return <Navigate to="/" replace />;
  }

  // Logged in but hasn't completed onboarding
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // Logged in and onboarded → render the actual route
  return children;
}

// A wrapper to redirect logged-in users away from auth pages
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  const isOnboarded = localStorage.getItem('onboarded') === 'true';

  if (currentUser) {
    // If not onboarded, send straight to onboarding (not dashboard)
    if (!isOnboarded) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

// Main Application Entry Point
// Sets up the global contexts (Theme, Auth, Project) and defining the application's routing map.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <GlobalLogger />
            <Routes>
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            
            {/* Main App Routes */}
            <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<Settings />} />
              <Route path="workspaces" element={<Workspaces />} />
              <Route path="workspaces/:id" element={<WorkspaceDetail />} />
              <Route path="blueprint" element={<Blueprint />} />
              <Route path="blueprint/:projectId" element={<Blueprint />} />
              
              {/* Dynamic Project Routes */}
              <Route path="project/:projectId/workflow" element={<ProjectWorkflow />} />
              <Route path="project/:projectId/tasks" element={<ProjectTasks />} />
              <Route path="project/:projectId/team" element={<ProjectTeam />} />
              <Route path="project/:projectId/activity" element={<ProjectActivity />} />

              {/* Other Sidebar/Header Routes */}
              <Route path="todo" element={<Todo />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="archive" element={<Archive />} />
              <Route path="profile" element={<Profile />} />
              <Route path="help" element={<Help />} />
            </Route>
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
