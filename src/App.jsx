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
import LandingPage from './pages/LandingPage';
import Project1Workflow from './pages/Project1Workflow';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Archive from './pages/Archive';
import Profile from './pages/Profile';
import Help from './pages/Help';
import ProjectTasks from './pages/ProjectTasks';
import ProjectTeam from './pages/ProjectTeam';
import ProjectAI from './pages/ProjectAI';

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
            
            {/* Project 1 Routes */}
            <Route path="project1-workflow" element={<Project1Workflow />} />
            <Route path="project1-ai" element={<ProjectAI projectName="Project 1" />} />
            <Route path="project1-tasks" element={<ProjectTasks projectName="Project 1" />} />
            <Route path="project1-team" element={<ProjectTeam projectName="Project 1" />} />

            {/* Project 2 Routes */}
            <Route path="project2-workflow" element={<EmptyPage />} />
            <Route path="project2-ai" element={<ProjectAI projectName="Project 2" />} />
            <Route path="project2-tasks" element={<ProjectTasks projectName="Project 2" />} />
            <Route path="project2-team" element={<ProjectTeam projectName="Project 2" />} />

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
    </AuthProvider>
  );
}
