import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, PlayCircle, CalendarClock, MoreVertical, ChevronRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';

const STATUS_OPTIONS = [
  { label: 'Upcoming',    value: 'todo',       dot: 'bg-gray-400' },
  { label: 'In Progress', value: 'in_progress', dot: 'bg-amber-400' },
  { label: 'Completed',   value: 'completed',   dot: 'bg-green-500' },
  { label: 'Stopped',     value: 'stopped',     dot: 'bg-red-500' },
  { label: 'Backlog',     value: 'blocked',     dot: 'bg-orange-400' },
];

function TaskCard({ task, colorClass, textClass = 'text-[#1D1E1B]', onStatusChange, projectName }) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuPos, setMenuPos]     = useState({ top: 0, left: 0 });
  const btnRef     = useRef(null);
  const menuRef    = useRef(null);
  const subMenuRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate   = useNavigate();

  // Shared timer helpers — cancel prevents close while mouse travels between panels
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setStatusOpen(false);
      setMenuOpen(false);
    }, 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  // Open main menu on ⋯ click, position via bounding rect
  const openMenu = (e) => {
    e.stopPropagation();
    cancelClose();
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 160 });
    setMenuOpen(v => !v);
    setStatusOpen(false);
  };

  // Click-outside closes everything
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      const inBtn     = btnRef.current     && btnRef.current.contains(e.target);
      const inMenu    = menuRef.current    && menuRef.current.contains(e.target);
      const inSubMenu = subMenuRef.current && subMenuRef.current.contains(e.target);
      if (!inBtn && !inMenu && !inSubMenu) {
        setMenuOpen(false);
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const handleCardClick = (e) => {
    if (btnRef.current && btnRef.current.contains(e.target)) return;
    if (task.project_id) navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } });
  };

  // Submenu is flush to the left of the main menu (no gap)
  const subMenuLeft = menuPos.left - 158;

  return (
    <div
      onClick={handleCardClick}
      className={`relative group rounded-lg border shadow-sm p-3 hover:shadow-md transition-all cursor-pointer ${colorClass}`}
    >
      {/* Header row */}
      <div className="flex justify-between items-start gap-2">
        <h3 className={`font-semibold ${textClass} text-sm leading-snug flex-1`}>{task.title}</h3>
        <button
          ref={btnRef}
          onClick={openMenu}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-all flex-shrink-0"
          title="More options"
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Footer row */}
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

      {/* Portal: main dropdown */}
      {menuOpen && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999, width: '160px' }}
          className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl py-1 text-sm"
        >
          {/* Change status — hover opens submenu */}
          <button
            onMouseEnter={() => { cancelClose(); setStatusOpen(true); }}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left font-medium transition-colors rounded-xl
              ${statusOpen
                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                : 'text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
          >
            <span>Change status</span>
            <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${statusOpen ? '-rotate-90' : ''}`} />
          </button>
        </div>,
        document.body
      )}

      {/* Portal: status submenu — flush against the left edge of the main menu */}
      {menuOpen && statusOpen && createPortal(
        <div
          ref={subMenuRef}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{ position: 'fixed', top: menuPos.top, left: subMenuLeft, zIndex: 9999, width: '156px' }}
          className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl py-1 text-sm"
        >
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onStatusChange(task.id, opt.value); setMenuOpen(false); setStatusOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.dot}`} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function Todo() {
  const { tasks, projects, changeTaskStatus, loading } = useProject();
  const { currentUser } = useAuth();
  const { isLoading } = useOutletContext() || {};

  // Show tasks assigned to current user that are not completed and belong to active projects
  const activeProjects = projects.filter(p => !p.is_archived);
  const activeProjectIds = new Set(activeProjects.map(p => p.id));
  const currentUsername = currentUser?.username?.toLowerCase() || '';

  const myTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!activeProjectIds.has(t.project_id)) return false;
    return t.assigned_to && t.assigned_to.toLowerCase() === currentUsername;
  });

  const resolveProjectName = (taskProjectId) => {
    if (!taskProjectId) return 'General';
    const match = projects.find(p => p.id === taskProjectId);
    return match ? match.name : taskProjectId;
  };

  const getStatus = (t) => (t.status || 'todo').toLowerCase();

  const delayedTasks  = myTasks.filter(t => ['stopped','delayed','blocked','paused','error'].includes(getStatus(t)));
  const inProgressTasks = myTasks.filter(t => getStatus(t) === 'in_progress');
  const upcomingTasks = myTasks.filter(t => ['todo','upcoming','pending'].includes(getStatus(t)));

  if (loading || isLoading) {
    return (
      <div className="w-full h-full flex flex-col animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 dark:bg-[#27272A] rounded"></div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-6">
          {['bg-red-100 border-red-200','bg-amber-100 border-amber-200','bg-sky-100 border-sky-200'].map((cls, i) => (
            <div key={i} className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] overflow-hidden shadow-inner h-full">
              <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-[#27272A]"></div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-[#27272A] rounded"></div>
                <div className="ml-auto w-6 h-4 bg-gray-300 dark:bg-[#27272A] rounded-full"></div>
              </div>
              <div className="flex-1 p-4 space-y-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`rounded-lg border shadow-sm p-3 ${cls} dark:opacity-20`}>
                    <div className="h-4 w-3/4 bg-gray-300/60 rounded"></div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="h-4 w-16 bg-gray-300/60 rounded-full"></div>
                      <div className="h-3 w-8 bg-gray-300/60 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = [
    {
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
      label: 'Backlog',
      tasks: delayedTasks,
      colorClass: 'bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30',
      textClass: 'text-red-900 dark:text-red-200',
      empty: 'No backlog tasks',
    },
    {
      icon: <PlayCircle className="w-4 h-4 text-amber-500" />,
      label: 'In Progress',
      tasks: inProgressTasks,
      colorClass: 'bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
      textClass: 'text-amber-900 dark:text-amber-200',
      empty: 'No tasks in progress',
    },
    {
      icon: <CalendarClock className="w-4 h-4 text-blue-500" />,
      label: 'Upcoming',
      tasks: upcomingTasks,
      colorClass: 'bg-sky-100 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900/30',
      textClass: 'text-sky-900 dark:text-sky-200',
      empty: 'No upcoming tasks',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">My Tasks</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-6">
        {columns.map(col => (
          <div key={col.label} className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#09090B] rounded-xl border-2 border-gray-200 dark:border-[#27272A] shadow-inner">
            <div className="p-3 border-b-2 border-gray-200 dark:border-[#27272A] bg-gray-100 dark:bg-[#18181B] flex items-center gap-2 sticky top-0">
              {col.icon}
              <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">{col.label}</h2>
              <span className="ml-auto bg-gray-200 dark:bg-[#27272A] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {col.tasks.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {col.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  colorClass={col.colorClass}
                  textClass={col.textClass}
                  projectName={resolveProjectName(task.project_id)}
                  onStatusChange={changeTaskStatus}
                />
              ))}
              {col.tasks.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 italic py-8">
                  {col.empty}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
