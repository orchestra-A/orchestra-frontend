import { useState, useEffect } from 'react';
import { AlertCircle, PlayCircle, CalendarClock, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export default function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, tasks, changeTaskStatus } = useProject();
  const { currentUser } = useAuth();
  const [contextMenu, setContextMenu] = useState(null);
  
  const [assigneeFilter, setAssigneeFilter] = useState(() => {
    if (location.state && location.state.assignee !== undefined) return location.state.assignee;
    return currentUser?.name || currentUser?.username || null;
  });
  
  const [assigneeAliases, setAssigneeAliases] = useState(() => {
    if (location.state && location.state.assigneeAliases !== undefined) return location.state.assigneeAliases;
    return [currentUser?.username, currentUser?.name, currentUser?.email, currentUser?.user_id].filter(Boolean);
  });

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleContextMenu = (e, task) => {
    e.preventDefault();
    setContextMenu({
      id: task.id,
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const decodedId = decodeURIComponent(projectId || "").trim();
  const project = projects.find(p => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : "Project";

  // Filter all tasks for this project using canonical project IDs
  // Task project_ids are normalized to canonical IDs by ProjectContext
  let projectTasks = project
    ? tasks.filter(t => t.project_id === project.id)
    : [];

  if (assigneeFilter) {
    console.log('[DEBUG] Filtering tasks for Assignee:', assigneeFilter);
    console.log('[DEBUG] Aliases:', assigneeAliases);
    console.log('[DEBUG] All tasks before filter:', projectTasks);

    projectTasks = projectTasks.filter(t => {
      const assigned = t.assigned_to || t.assignee || '';
      const assignedStr = typeof assigned === 'string' ? assigned : (Array.isArray(assigned) ? assigned.join(' ') : JSON.stringify(assigned));
      const lowerAssigned = assignedStr.toLowerCase();
      
      const matchFilter = lowerAssigned.includes(assigneeFilter.toLowerCase());
      const matchAlias = assigneeAliases.some(alias => typeof alias === 'string' && lowerAssigned.includes(alias.toLowerCase()));
      
      if (matchFilter || matchAlias) {
         console.log(`[DEBUG] Task Match! Task: "${t.title}" | AssignedTo: "${assignedStr}"`);
      }
      
      return matchFilter || matchAlias;
    });
    
    console.log('[DEBUG] Tasks after filter:', projectTasks);
  }

  const getStatus = (t) => (t.status || 'todo').toLowerCase();

  const haltedTasks = projectTasks.filter(t => {
    const s = getStatus(t);
    return ['stopped', 'delayed', 'blocked', 'paused', 'error'].includes(s);
  });
  const inProgressTasks = projectTasks.filter(t => getStatus(t) === 'in_progress');
  const completedTasks = projectTasks.filter(t => ['completed', 'done', 'finished'].includes(getStatus(t)));
  
  // Upcoming acts as a catch-all for todo, pending, backlog, and any unmapped status
  const upcomingTasks = projectTasks.filter(t => {
    const s = getStatus(t);
    return !['stopped', 'delayed', 'blocked', 'paused', 'error'].includes(s) && 
           s !== 'in_progress' && 
           !['completed', 'done', 'finished'].includes(s);
  });

  const TaskCard = ({ task, colorClass, textClass = "text-[#1D1E1B]" }) => {
    return (
      <div 
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('taskId', task.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onClick={() => navigate(`/project/${projectId}/workflow`, { state: { selectedTaskId: task.id } })}
        onContextMenu={(e) => handleContextMenu(e, task)}
        className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing ${colorClass} ${task.isUpdating ? 'animate-pulse pointer-events-none' : ''}`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold ${textClass} text-sm leading-snug`}>{task.title}</h3>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100/50 border-none text-[#2B3B26]">
            {projectName}
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">{projectName} — Tasks</h1>
          {assigneeFilter && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500 dark:text-white/50">Filtered by:</span>
              <Badge variant="secondary" className="flex items-center gap-1 bg-[#6B905F]/15 text-[#6B905F] dark:text-[#7ED957]">
                {assigneeFilter}
                <X className="w-3 h-3 cursor-pointer ml-1 hover:text-red-500" onClick={() => setAssigneeFilter(null)} />
              </Badge>
            </div>
          )}
        </div>
        <Button className="bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-hidden pb-6">
        {/* Column 1: Halted */}
        <div 
          className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('taskId');
            if (taskId) changeTaskStatus(taskId, 'stopped');
          }}
        >
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Halted</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{haltedTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {haltedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                colorClass="bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30" 
                textClass="text-red-900 dark:text-red-200" 
              />
            ))}
            {haltedTasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 italic py-8">
                No halted tasks
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div 
          className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('taskId');
            if (taskId) changeTaskStatus(taskId, 'in_progress');
          }}
        >
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0">
            <PlayCircle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">In Progress</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                colorClass="bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30" 
                textClass="text-amber-900 dark:text-amber-200" 
              />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 italic py-8">
                No tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Upcoming */}
        <div 
          className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('taskId');
            if (taskId) changeTaskStatus(taskId, 'todo');
          }}
        >
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0">
            <CalendarClock className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Upcoming</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{upcomingTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {upcomingTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                colorClass="bg-sky-100 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900/30" 
                textClass="text-sky-900 dark:text-sky-200" 
              />
            ))}
            {upcomingTasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 italic py-8">
                No upcoming tasks
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Completed */}
        <div 
          className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('taskId');
            if (taskId) changeTaskStatus(taskId, 'completed');
          }}
        >
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Completed</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{completedTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {completedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                colorClass="bg-green-100 border-green-200 dark:bg-green-950/20 dark:border-green-900/30" 
                textClass="text-green-900 dark:text-green-200" 
              />
            ))}
            {completedTasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 italic py-8">
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#6B905F] dark:bg-[#6B905F] rounded-md shadow-lg border border-gray-200 py-1 min-w-[150px] text-sm overflow-hidden text-white"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
            onClick={() => {
              changeTaskStatus(contextMenu.id, 'todo');
              setContextMenu(null);
            }}
          >
            Set Pending
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
            onClick={() => {
              changeTaskStatus(contextMenu.id, 'in_progress');
              setContextMenu(null);
            }}
          >
            Set In Progress
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
            onClick={() => {
              changeTaskStatus(contextMenu.id, 'completed');
              setContextMenu(null);
            }}
          >
            Set Completed
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
            onClick={() => {
              changeTaskStatus(contextMenu.id, 'blocked');
              setContextMenu(null);
            }}
          >
            Set Blocked
          </button>
        </div>
      )}
    </div>
  );
}
