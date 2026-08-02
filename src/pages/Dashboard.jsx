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

  // Filter tasks to only those belonging to projects the user is a part of
  // Projects array is already filtered by ProjectContext to only include accessible ones
  const accessibleProjectIds = new Set(projects.map(p => p.id));
  const filteredTasks = tasks.filter(t => t.project_id && accessibleProjectIds.has(t.project_id));

  // Resolve a task's project_id to the project display name
  const resolveProjectName = (taskProjectId) => {
    if (!taskProjectId) return 'General';
    const match = projects.find(p => p.id === taskProjectId);
    return match ? match.name : taskProjectId;
  };

  const getStatus = (t) => t.status ? t.status.toLowerCase() : '';
  const haltedTasks = filteredTasks.filter(t => {
    const s = getStatus(t);
    return s === 'stopped' || s === 'blocked' || s === 'delayed';
  });
  const inProgressTasks = filteredTasks.filter(t => getStatus(t) === 'in_progress');

  const TaskCard = ({ task, colorClass, textClass = "text-[#1D1E1B]" }) => (
    <div
      onClick={() => task.project_id ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } }) : navigate('/todo')}
      className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold ${textClass} text-sm leading-snug`}>{task.title}</h3>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100/50 border-none text-[#2B3B26]">
          {resolveProjectName(task.project_id)}
        </Badge>
        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${textClass}`}>
            {task.priority}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Welcome Section */}
      <div className="mb-4 shrink-0">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-lg font-bold mb-0.5">
          Welcome back{currentUser?.username ? `, ${currentUser.username}` : ''}
        </h1>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-4">

        {/* Left Column: Projects Overview */}
        <div className="flex flex-col gap-4">
          {/* Active Projects Stat Box */}
          <div 
            onClick={() => navigate('/todo')}
            className="bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] p-5 shadow-sm flex flex-col justify-center transition-all hover:border-[#6B905F] dark:border-[#6B905F]/30 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-white/60 font-medium">Active Projects</span>
              <div className="w-10 h-10 bg-[#6B905F] dark:bg-[#6B905F]/10 rounded-lg flex items-center justify-center shadow-sm">
                <FolderOpen className="w-5 h-5 text-[#7ED957] dark:text-[#7ED957]" />
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
              {projects.length === 0 ? (
                <div className="col-span-2 bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-dashed border-gray-300 dark:border-[#27272A] p-8 flex flex-col items-center justify-center text-center">
                  <FolderOpen className="w-8 h-8 text-gray-400 dark:text-white/40 mb-3 opacity-50" />
                  <h3 className="text-[#1D1E1B] dark:text-white/90 font-medium text-sm mb-1">No projects yet</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Click to create your first workflow</p>
                </div>
              ) : (
                projects.map(project => (
                <div key={project.id} className="relative group">
                  <button
                    onClick={() => navigate(`/project/${project.id}/tasks`)}
                    className="w-full bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] p-4 shadow-sm transition-all hover:shadow-md hover:border-[#6B905F] dark:border-[#6B905F]/30 text-left flex flex-col items-center justify-center aspect-square group/btn"
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
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] text-gray-400 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 z-10"
                    title="Delete Project"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )))}



            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="lg:col-span-2 bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-2xl p-4 border border-gray-200 dark:border-[#27272A]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Middle Column: Behind Tasks Widget */}
            <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner h-full">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0 z-10">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Halted</h2>
                <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{haltedTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {haltedTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70 py-8">
                    <AlertCircle className="w-8 h-8 text-gray-400 dark:text-[#27272A] mb-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-white/40">You're all caught up!</span>
                  </div>
                ) : (
                  haltedTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30" textClass="text-red-900 dark:text-red-200" />)
                )}
              </div>
            </div>

            {/* Right Column: In Progress Tasks Widget */}
            <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner h-full">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0 z-10">
                <PlayCircle className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">In Progress</h2>
                <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {inProgressTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70 py-8">
                    <PlayCircle className="w-8 h-8 text-gray-400 dark:text-[#27272A] mb-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-white/40">No active tasks</span>
                  </div>
                ) : (
                  inProgressTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30" textClass="text-amber-900 dark:text-amber-200" />)
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 page-enter">
          <div className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1E1B] dark:text-white/90 mb-2">Delete Project?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">"{projectToDelete.name}"</span>? This action cannot be undone and all associated tasks and data will be permanently removed.
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
