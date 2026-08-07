import { FolderOpen, AlertCircle, PlayCircle, Clock, Plus, Trash2, X, MoreVertical, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useState, useEffect } from 'react';

const SolidFolderIcon = ({ color }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
    {/* Back flap / Tab with less rounding and dark outline. Y-shifted by -3 for perfect viewBox centering */}
    <path d="M8 14C8 12.3431 9.34315 11 11 11H25L29 15H53C54.6569 15 56 16.3431 56 18V27H8V14Z" fill={color} opacity="0.65" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    
    {/* Main Body with less rounding and dark outline */}
    <path d="M8 22C8 20.3431 9.34315 19 11 19H53C54.6569 19 56 20.3431 56 22V50C56 51.6569 54.6569 53 53 53H11C9.34315 53 8 51.6569 8 50V22Z" fill={color} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    
    {/* Cell shaded highlight */}
    <path d="M8 22C8 20.3431 9.34315 19 11 19H53C54.6569 19 56 20.3431 56 22V25H8V22Z" fill="white" opacity="0.25"/>
  </svg>
);

// Main Dashboard Page
// Displays an overview of user projects, current tasks, and recent alerts.
export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Consume global project and task data from the ProjectContext
  const { projects, tasks, deleteProject, archiveProject, changeTaskStatus } = useProject();

  // Local state for managing project deletion confirmation modal
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToArchive, setProjectToArchive] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const confirmArchive = () => {
    if (projectToArchive) {
      archiveProject(projectToArchive.id, true);
      setProjectToArchive(null);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.project-dashboard-dropdown')) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Global cleanup for drag operations to prevent stuck clones
  useEffect(() => {
    const handleDragEndGlobal = () => {
      const clone = document.getElementById('custom-drag-image');
      if (clone) clone.remove();
      
      // Clean up any lingering opacity classes on the original dragged elements
      document.querySelectorAll('.opacity-20').forEach(el => {
        if (el.draggable) el.classList.remove('opacity-20');
      });
    };

    window.addEventListener('dragend', handleDragEndGlobal);
    window.addEventListener('drop', handleDragEndGlobal);
    
    return () => {
      window.removeEventListener('dragend', handleDragEndGlobal);
      window.removeEventListener('drop', handleDragEndGlobal);
      handleDragEndGlobal(); // cleanup on unmount/page change
    };
  }, []);

  const activeProjects = projects.filter(p => !p.is_archived);

  // Filter tasks to only those belonging to projects the user is a part of
  // Projects array is already filtered by ProjectContext to only include accessible ones
  const accessibleProjectIds = new Set(activeProjects.map(p => p.id));
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

  const TaskCard = ({ task, colorClass, textClass = "text-[#1D1E1B]" }) => {
    let outlineColor = '!outline-gray-300';
    if (colorClass.includes('red')) outlineColor = '!outline-red-400';
    if (colorClass.includes('amber')) outlineColor = '!outline-amber-400';
    if (colorClass.includes('green')) outlineColor = '!outline-green-400';
    if (colorClass.includes('blue')) outlineColor = '!outline-blue-400';
    if (colorClass.includes('purple')) outlineColor = '!outline-purple-400';

    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('taskId', task.id);
          e.dataTransfer.effectAllowed = 'move';
          
          // Hide native drag image to avoid OS-level transparency and clipping
          const emptyImage = new Image();
          emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          e.dataTransfer.setDragImage(emptyImage, 0, 0);
          
          // Remove any existing clone
          const existingClone = document.getElementById('custom-drag-image');
          if (existingClone) existingClone.remove();
          
          // Create custom drag image clone
          const clone = e.currentTarget.cloneNode(true);
          const rect = e.currentTarget.getBoundingClientRect();
          clone.id = 'custom-drag-image';
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.position = 'fixed';
          clone.style.pointerEvents = 'none'; // Prevent interfering with drop zones
          clone.style.zIndex = '999999';
          clone.style.opacity = '0.85';
          clone.style.backdropFilter = 'blur(4px)';
          clone.style.WebkitBackdropFilter = 'blur(4px)';
          clone.style.margin = '0';
          
          // Add bright solid outline with the same color
          clone.classList.add('outline', 'outline-[1.5px]', 'outline-offset-1', outlineColor, 'shadow-2xl');
          clone.classList.remove('opacity-20', 'hover:shadow-md');
          
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          clone.dataset.offsetX = offsetX;
          clone.dataset.offsetY = offsetY;
          
          clone.style.left = `${e.clientX - offsetX}px`;
          clone.style.top = `${e.clientY - offsetY}px`;
          
          document.body.appendChild(clone);
          
          setTimeout(() => {
            if (e.target) e.target.classList.add('opacity-20');
          }, 0);
        }}
        onDrag={(e) => {
          const clone = document.getElementById('custom-drag-image');
          if (clone && (e.clientX !== 0 || e.clientY !== 0)) {
            const offsetX = parseFloat(clone.dataset.offsetX);
            const offsetY = parseFloat(clone.dataset.offsetY);
            clone.style.left = `${e.clientX - offsetX}px`;
            clone.style.top = `${e.clientY - offsetY}px`;
          }
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove('opacity-20');
          const clone = document.getElementById('custom-drag-image');
          if (clone) clone.remove();
        }}
        onClick={() => task.project_id ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } }) : navigate('/todo')}
        className={`rounded-lg border shadow-sm p-3 transition-shadow cursor-pointer ${colorClass} ${task.isUpdating ? 'animate-pulse pointer-events-none opacity-80' : 'hover:shadow-md'}`}
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
};

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
        <div className="flex flex-col gap-4 min-h-0">
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
            <div className="text-5xl font-bold text-[#1D1E1B] dark:text-white/90">{activeProjects.length}</div>
            <div className="text-sm text-gray-500 dark:text-white/50 mt-2">Currently being tracked</div>
          </div>

          {/* Individual Projects Grid */}
          <div className="flex-1 min-h-0 flex flex-col">
            <h2 className="text-[#1D1E1B] dark:text-white/90 font-bold mb-3 text-sm shrink-0">Your Projects</h2>
            <div className="grid grid-cols-3 gap-3 auto-rows-max overflow-y-auto flex-1 pr-2 pb-2">

              {/* Dynamic Project Cards */}
              {activeProjects.length === 0 ? (
                <div className="col-span-2 bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-dashed border-gray-300 dark:border-[#27272A] p-6 flex flex-col items-center justify-center text-center">
                  <FolderOpen className="w-8 h-8 text-gray-400 dark:text-white/40 mb-3 opacity-50" />
                  <h3 className="text-[#1D1E1B] dark:text-white/90 font-medium text-sm mb-1">No projects yet</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Click to create your first workflow</p>
                </div>
              ) : (
                activeProjects.map(project => {
                  const getInitials = (name) => {
                    if (!name) return '';
                    const cleanName = name.replace(/^(project\s*proj-|proj-)/i, '').trim();
                    const words = cleanName.split(/[-_ ]+/).filter(Boolean);
                    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
                    return cleanName.substring(0, 2).toUpperCase();
                  };
                  return (
                <div key={project.id} className="relative group project-dashboard-dropdown">
                  <button
                    onClick={() => navigate(`/project/${project.id}/tasks`)}
                    className="w-full h-[140px] bg-white dark:bg-[#09090B] rounded-2xl border border-gray-200 dark:border-[#27272A] p-2 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#6B905F]/50 text-left flex flex-col items-center justify-center group/btn relative overflow-hidden"
                  >
                    {/* Soft background glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${project.color || '#6B905F'}15 0%, transparent 70%)` }} />
                    
                    {/* Folder Icon - Absolutely Centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
                      <div className="w-14 h-14 flex items-center justify-center group-hover/btn:scale-110 transition-transform duration-300 relative z-10">
                        <SolidFolderIcon color={project.color || '#6B905F'} />
                      </div>
                    </div>
                    
                    {/* Project Name - Anchored to Bottom */}
                    <div className="mt-auto w-full relative z-10">
                      <h3 className="text-[#1D1E1B] dark:text-white/90 font-bold text-xs text-center line-clamp-2 px-1 pb-1">{project.name}</h3>
                    </div>
                  </button>
                  {project.isCreator && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpenId(dropdownOpenId === project.id ? null : project.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] text-gray-400 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1D1E1B] hover:border-[#6B905F]/30 hover:bg-[#6B905F]/10 dark:hover:bg-white/20 z-10"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {dropdownOpenId === project.id && (
                    <div className="absolute right-0 top-10 w-32 bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-[#27272A] rounded-md shadow-lg z-50 py-1 flex flex-col">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToArchive(project);
                          setDropdownOpenId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-[#1D1E1B] dark:text-white/90 hover:bg-gray-100 dark:hover:bg-white/5"
                      >
                        Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setDropdownOpenId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
              })
              )}



            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="lg:col-span-2 bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-2xl p-4 border border-gray-200 dark:border-[#27272A]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Middle Column: Behind Tasks Widget */}
            <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner h-[550px]">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0 z-10">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Halted</h2>
                <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{haltedTasks.length}</span>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-3 space-y-3"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  document.getElementById('custom-drag-image')?.remove();
                  document.querySelectorAll('.opacity-20').forEach(el => el.classList.remove('opacity-20'));
                  const taskId = e.dataTransfer.getData('taskId');
                  if (taskId) changeTaskStatus(taskId, 'stopped');
                }}
              >
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
            <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner h-[550px]">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0 z-10">
                <PlayCircle className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">In Progress</h2>
                <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-3 space-y-3"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  document.getElementById('custom-drag-image')?.remove();
                  document.querySelectorAll('.opacity-20').forEach(el => el.classList.remove('opacity-20'));
                  const taskId = e.dataTransfer.getData('taskId');
                  if (taskId) changeTaskStatus(taskId, 'in_progress');
                }}
              >
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

      {/* Archive Confirmation Dialog */}
      {projectToArchive && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 page-enter">
          <div className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-[#6B905F]/20 flex items-center justify-center mb-4">
                <Archive className="w-6 h-6 text-[#6B905F]" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1E1B] dark:text-white/90 mb-2">Archive Project?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to archive <span className="font-semibold text-gray-800 dark:text-gray-200">"{projectToArchive.name}"</span>? It will be locked from further edits but will remain accessible in the Archive tab.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToArchive(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 px-4 py-2 bg-[#6B905F] hover:bg-[#5A7A4F] text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
