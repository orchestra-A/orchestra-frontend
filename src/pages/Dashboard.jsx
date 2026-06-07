import { FolderOpen, AlertCircle, PlayCircle, Clock, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { projects, deleteProject } = useProject();

  const [projectToDelete, setProjectToDelete] = useState(null);

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const mockTasks = [
    { id: 1, title: 'Finalize Database Schema', project: 'Project Orchestra', status: 'stopped', deadline: '2026-06-01' },
    { id: 2, title: 'Fix Auth Bugs', project: 'Project Orchestra', status: 'stopped', deadline: '2026-06-03' },
    { id: 3, title: 'Implement Kanban Board', project: 'General', status: 'in_progress', deadline: '2026-06-05' },
    { id: 4, title: 'Review Marketing Copy', project: 'Project Marketing', status: 'in_progress', deadline: '2026-06-07' },
    { id: 5, title: 'Client Feedback Sync', project: 'Project Marketing', status: 'in_progress', deadline: '2026-06-08' },
  ];

  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const delayedTasks = sortTasks(mockTasks.filter(t => t.status === 'stopped' || t.status === 'delayed')).slice(0, 3);
  const inProgressTasks = sortTasks(mockTasks.filter(t => t.status === 'in_progress')).slice(0, 3);

  const TaskCard = ({ task, colorClass }) => (
    <div
      onClick={() => navigate('/todo')}
      className={`rounded-lg border shadow-sm p-2.5 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="font-semibold text-gray-900 text-[13px] leading-snug">{task.title}</h3>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-600">
          {task.project}
        </Badge>
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          <Clock className="w-3 h-3" />
          <span>{task.deadline}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col">
      {/* Welcome Section */}
      <div className="mb-4 shrink-0">
        <h1 className="text-gray-900 dark:text-white/90 text-lg font-bold mb-0.5">Welcome back, {currentUser?.name || "Guest"}</h1>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-4">

        {/* Left Column: Projects Overview */}
        <div className="flex flex-col gap-4">
          {/* Active Projects Stat Box */}
          <div className="bg-white dark:bg-[#1A1E2E] rounded-lg border border-gray-200 dark:border-[#2A3142] p-5 shadow-sm flex flex-col justify-center transition-all hover:border-[#4A90E2]/30 hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-white/60 font-medium">Active Projects</span>
              <div className="w-10 h-10 bg-[#4A90E2]/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[#4A90E2]" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 dark:text-white/90">{projects.length}</div>
            <div className="text-sm text-gray-500 dark:text-white/50 mt-2">Currently being tracked</div>
          </div>

          {/* Individual Projects Grid */}
          <div className="flex-1">
            <h2 className="text-gray-900 dark:text-white/90 font-bold mb-3 text-sm">Your Projects</h2>
            <div className="grid grid-cols-2 gap-4">

              {/* Dynamic Project Cards */}
              {projects.map(project => (
                <div key={project.id} className="relative group">
                  <button
                    onClick={() => navigate(`/${project.id}-tasks`)}
                    className="w-full bg-white dark:bg-[#1A1E2E] rounded-lg border border-gray-200 dark:border-[#2A3142] p-4 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 text-left flex flex-col items-center justify-center aspect-square group/btn"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover/btn:scale-110 transition-transform" style={{ backgroundColor: `${project.color}15` }}>
                      <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <h3 className="text-gray-900 dark:text-white/90 font-semibold text-xs text-center line-clamp-2 px-2">{project.name}</h3>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-[#1A1E2E] border border-gray-200 dark:border-[#2A3142] text-gray-400 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 z-10"
                    title="Delete Project"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}



            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="lg:col-span-2 bg-gray-50/50 dark:bg-[#1A1E2E] rounded-2xl p-4 border border-gray-200 dark:border-[#2A3142]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Middle Column: Behind Tasks Widget */}
            <div className="flex flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-md dark:shadow-black/40 transition-shadow hover:shadow-lg h-full">
              <div className="p-3 border-b border-gray-100 dark:border-[#2A3142] flex items-center gap-2 sticky top-0 z-10 bg-transparent">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Behind / Delayed</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {delayedTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-red-50 border-red-200" />)}
              </div>
            </div>

            {/* Right Column: In Progress Tasks Widget */}
            <div className="flex flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-md dark:shadow-black/40 transition-shadow hover:shadow-lg h-full">
              <div className="p-3 border-b border-gray-100 dark:border-[#2A3142] flex items-center gap-2 sticky top-0 z-10 bg-transparent">
                <PlayCircle className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">In Progress</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {inProgressTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-amber-50 border-amber-200" />)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 page-enter">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-2">Delete Project?</h3>
              <p className="text-gray-500 dark:text-white/50 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{projectToDelete.name}"</span>? This action cannot be undone and all associated tasks and data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
