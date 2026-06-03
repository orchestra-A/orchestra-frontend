import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import EmptyPage from './pages/EmptyPage';
import ProjMarketingWorkflow from './pages/ProjMarketingWorkflow';
import ProjOrchestraWorkflow from './pages/ProjOrchestraWorkflow';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';

// A wrapper to protect routes
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/landing" replace />;
  }
  return children;
}

// A wrapper to redirect logged-in users away from auth pages
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          
          {/* Main App Routes */}
          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Project Marketing Routes */}
            <Route path="proj_marketing-workflow" element={<ProjMarketingWorkflow />} />
            <Route path="proj_marketing-ai" element={<EmptyPage />} />
            <Route path="proj_marketing-tasks" element={<EmptyPage />} />
            <Route path="proj_marketing-team" element={<EmptyPage />} />

            {/* Project Orchestra Routes */}
            <Route path="proj_orchestra-workflow" element={<ProjOrchestraWorkflow />} />
            <Route path="proj_orchestra-ai" element={<EmptyPage />} />
            <Route path="proj_orchestra-tasks" element={<EmptyPage />} />
            <Route path="proj_orchestra-team" element={<EmptyPage />} />

            {/* Other Sidebar/Header Routes */}
            <Route path="todo" element={<EmptyPage />} />
            <Route path="calendar" element={<EmptyPage />} />
            <Route path="archive" element={<EmptyPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<EmptyPage />} />
          </Route>
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
