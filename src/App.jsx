import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Workspaces from './pages/Workspaces';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import EmptyPage from './pages/EmptyPage';
import ProjMarketingWorkflow from './pages/ProjMarketingWorkflow';
import ProjOrchestraWorkflow from './pages/ProjOrchestraWorkflow';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Archive from './pages/Archive';
import Help from './pages/Help';
import ProjectTasks from './pages/ProjectTasks';
import ProjectTeam from './pages/ProjectTeam';
import ProjectAI from './pages/ProjectAI';
import Blueprint from './pages/Blueprint';

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
      <ProjectProvider>
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
              <Route path="workspaces" element={<Workspaces />} />
              <Route path="blueprint" element={<Blueprint />} />
              <Route path="blueprint/:projectId" element={<Blueprint />} />
              
              {/* Project Marketing Routes */}
              <Route path="proj_marketing-workflow" element={<ProjMarketingWorkflow />} />
              <Route path="proj_marketing-ai" element={<ProjectAI projectName="Project Marketing" />} />
              <Route path="proj_marketing-tasks" element={<ProjectTasks projectName="Project Marketing" />} />
              <Route path="proj_marketing-team" element={<ProjectTeam projectName="Project Marketing" />} />

              {/* Project Orchestra Routes */}
              <Route path="proj_orchestra-workflow" element={<ProjOrchestraWorkflow />} />
              <Route path="proj_orchestra-ai" element={<ProjectAI projectName="Project Orchestra" />} />
              <Route path="proj_orchestra-tasks" element={<ProjectTasks projectName="Project Orchestra" />} />
              <Route path="proj_orchestra-team" element={<ProjectTeam projectName="Project Orchestra" />} />

              {/* Dynamic Project Routes */}
              <Route path=":projectId-workflow" element={<ProjOrchestraWorkflow />} />
              <Route path=":projectId-ai" element={<ProjectAI projectName="Dynamic Project" />} />
              <Route path=":projectId-tasks" element={<ProjectTasks projectName="Dynamic Project" />} />
              <Route path=":projectId-team" element={<ProjectTeam projectName="Dynamic Project" />} />

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
  );
}
