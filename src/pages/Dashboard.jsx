import { FolderOpen, AlertCircle, PlayCircle, Clock, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useState, useEffect } from 'react';

// Main Dashboard Page
// Displays an overview of user projects, current tasks, and recent alerts.
export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Consume global project and task data from the ProjectContext
  const { projects, tasks, deleteProject } = useProject();

  // Local state for managing project deletion confirmation modal
  const [projectToDelete, setProjectToDelete] = useState(null);

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const delayedTasks = tasks.filter(t => t.status === 'stopped' || t.status === 'delayed').slice(0, 3);
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').slice(0, 3);

  const TaskCard = ({ task, colorClass }) => (
    <div
      onClick={() => navigate('/todo')}
      className={`rounded-lg border shadow-sm p-2.5 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="font-semibold text-[#1D1E1B] text-[13px] leading-snug">{task.title}</h3>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-600">
          {projects.find(p => p.id === task.project_id)?.name || task.project_id || 'General'}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col">
      {/* Welcome Section */}
      <div className="mb-4 shrink-0">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-lg font-bold mb-0.5">Welcome back</h1>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-4">

        {/* Left Column: Projects Overview */}
        <div className="flex flex-col gap-4">
          {/* Active Projects Stat Box */}
          <div className="bg-[#F4F1EB] dark:bg-[#121910] rounded-lg border border-gray-200 dark:border-[#2B3B26] p-5 shadow-sm flex flex-col justify-center transition-all hover:border-[#6B905F] dark:border-[#6B905F]/30 hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-white/60 font-medium">Active Projects</span>
              <div className="w-10 h-10 bg-[#6B905F] dark:bg-[#6B905F]/10 rounded-lg flex items-center justify-center shadow-sm">
                <FolderOpen className="w-5 h-5 text-[#51DD15] dark:text-[#51DD15]" />
              </div>
            </div>
            <div className="text-5xl font-bold text-[#1D1E1B] dark:text-white/90">{projects.length}</div>
            <div className="text-sm text-gray-500 dark:text-white/50 mt-2">Currently being tracked</div>
          </div>

          {/* Individual Projects Grid */}
          <div className="flex-1">
            <h2 className="text-[#1D1E1B] dark:text-white/90 font-bold mb-3 text-sm">Your Projects</h2>
            <div className="grid grid-cols-2 gap-4">

              {/* Dynamic Project Cards */}
              {projects.map(project => (
                <div key={project.id} className="relative group">
                  <button
                    onClick={() => navigate(`/${project.id}-tasks`)}
                    className="w-full bg-[#F4F1EB] dark:bg-[#121910] rounded-lg border border-gray-200 dark:border-[#2B3B26] p-4 shadow-sm transition-all hover:shadow-md hover:border-[#6B905F] dark:border-[#6B905F]/30 text-left flex flex-col items-center justify-center aspect-square group/btn"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover/btn:scale-110 transition-transform" style={{ backgroundColor: `${project.color}15` }}>
                      <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <h3 className="text-[#1D1E1B] dark:text-white/90 font-semibold text-xs text-center line-clamp-2 px-2">{project.name}</h3>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-[#F4F1EB] dark:bg-[#121910] border border-gray-200 dark:border-[#2B3B26] text-gray-400 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 z-10"
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
        <div className="lg:col-span-2 bg-[#F3F7F1]/50 dark:bg-[#121910] rounded-2xl p-4 border border-gray-200 dark:border-[#2B3B26]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Middle Column: Behind Tasks Widget */}
            <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#121910] rounded-xl border-2 border-gray-200 dark:border-[#2B3B26] overflow-hidden shadow-inner h-full">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#2B3B26] bg-gray-100 dark:bg-[#1C2618] flex items-center gap-2 sticky top-0 z-10">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Behind / Delayed</h2>
                <span className="ml-auto bg-gray-200 dark:bg-[#2B3B26] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{delayedTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {delayedTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-red-200 border-red-300" />)}
              </div>
            </div>

            {/* Right Column: In Progress Tasks Widget */}
            <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#121910] rounded-xl border-2 border-gray-200 dark:border-[#2B3B26] overflow-hidden shadow-inner h-full">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#2B3B26] bg-gray-100 dark:bg-[#1C2618] flex items-center gap-2 sticky top-0 z-10">
                <PlayCircle className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">In Progress</h2>
                <span className="ml-auto bg-gray-200 dark:bg-[#2B3B26] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {inProgressTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-amber-200 border-amber-300" />)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 page-enter">
          <div className="bg-[#6B905F] dark:bg-[#6B905F] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1E1B] dark:text-white/90 mb-2">Delete Project?</h3>
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
