import { useState, useEffect } from 'react';
import { Clock, AlertCircle, PlayCircle, CalendarClock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function Todo() {
  const { tasks, projects, changeTaskStatus } = useProject();
  const { currentUser } = useAuth();
  const [contextMenu, setContextMenu] = useState(null);

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

  const myTasks = tasks.filter(t => t.assigned_to === (currentUser?.username || ''));

  const delayedTasks = myTasks.filter(t => 
    t.status === 'stopped' || 
    t.status === 'delayed' || 
    t.status === 'blocked' || 
    t.status === 'paused' || 
    t.status === 'error'
  );
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const upcomingTasks = myTasks.filter(t => t.status === 'todo' || t.status === 'upcoming');

  const TaskCard = ({ task, colorClass, textClass = "text-[#1D1E1B]" }) => {
    const projectName = projects.find(p => p.id === task.project_id)?.name || task.project_id || 'General';
    return (
      <div 
        onContextMenu={(e) => handleContextMenu(e, task)}
        className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}
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
      <div className="mb-8">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">My Tasks</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-6">
        {/* Column 1: Halted */}
        <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner">
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Halted</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{delayedTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {delayedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                colorClass="bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30" 
                textClass="text-red-900 dark:text-red-200" 
              />
            ))}
            {delayedTasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 italic py-8">
                No halted tasks
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner">
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
        <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner">
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
              changeTaskStatus(contextMenu.id, 'stopped');
              setContextMenu(null);
            }}
          >
            Set Halted
          </button>
        </div>
      )}
    </div>
  );
}
