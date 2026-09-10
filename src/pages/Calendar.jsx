import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import { fetchProjects } from '../services/api';

// ─── Priority colour map ────────────────────────────────────────────────────
// pill = light tinted background, title text colour, badge bg, badge text
const PRIORITY_COLORS = {
  HIGH:     { pillBg: 'bg-lime-100 dark:bg-lime-900/40',       titleText: 'text-lime-800 dark:text-lime-300 font-bold',   badgeBg: 'bg-lime-200 dark:bg-lime-800/60',     badgeText: 'text-lime-900 font-bold dark:text-lime-200',   dot: 'bg-lime-500'   },
  MEDIUM:   { pillBg: 'bg-yellow-100 dark:bg-yellow-900/40',   titleText: 'text-yellow-800 dark:text-yellow-300',         badgeBg: 'bg-yellow-200 dark:bg-yellow-800/60', badgeText: 'text-yellow-900 dark:text-yellow-200',         dot: 'bg-yellow-500'   },
  LOW:      { pillBg: 'bg-sky-100 dark:bg-[#102A38]',             titleText: 'text-sky-800 dark:text-sky-400',             badgeBg: 'bg-sky-200 dark:bg-[#1A4259]',           badgeText: 'text-sky-900 dark:text-sky-200',           dot: 'bg-sky-500 dark:bg-sky-600'    },
  _DEFAULT: { pillBg: 'bg-gray-100 dark:bg-gray-900/40',           titleText: 'text-gray-700 dark:text-gray-300',           badgeBg: 'bg-gray-200 dark:bg-gray-800/60',         badgeText: 'text-gray-800 dark:text-gray-200',         dot: 'bg-gray-500'    },
};

function getTaskColor(priority) {
  return PRIORITY_COLORS[(priority || '').toUpperCase()] || PRIORITY_COLORS._DEFAULT;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayStr = formatDateStr(new Date());

// Returns midnight timestamp for a Date
const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// ─── Mini Calendar ──────────────────────────────────────────────────────────
function MiniCalendar({ currentDate, setCurrentDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: daysInPrevMonth - firstDay + i + 1, current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: i, current: true, fullDate: new Date(year, month, i) });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: i, current: false });
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="flex flex-col mb-6 bg-white dark:bg-[#18181B] rounded-xl border border-gray-100 dark:border-[#27272A] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm font-bold text-[#1D1E1B] dark:text-white/90">{monthName}</span>
        <div className="flex gap-1">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-gray-50 dark:hover:bg-[#27272A] transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-gray-50 dark:hover:bg-[#27272A] transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map(d => <span key={d} className="text-[10px] font-semibold text-gray-400">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          const isToday = c.current && formatDateStr(c.fullDate) === todayStr;
          return (
            <div key={i} onClick={() => c.current && setCurrentDate(c.fullDate)} className={`h-7 w-7 flex items-center justify-center text-[11px] rounded-full mx-auto ${isToday ? 'bg-[#6B905F] text-white font-bold shadow-sm' : c.current ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#27272A] cursor-pointer' : 'text-gray-300 dark:text-gray-600'}`}>
              {c.date}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Task Pill ───────────────────────────────────────────────────────────────
function TaskPill({ task, resolveProjectName, navigate, setTooltip, startCol, span, row, isStart, isEnd }) {
  const colors = getTaskColor(task.priority);

  let roundedClass = 'rounded-none';
  if (isStart && isEnd) roundedClass = 'rounded-md';
  else if (isStart) roundedClass = 'rounded-l-md rounded-r-none';
  else if (isEnd) roundedClass = 'rounded-r-md rounded-l-none';

  const ml = isStart ? 'ml-0.5' : '';
  const mr = isEnd   ? 'mr-0.5' : '';

  const priorityLabel = task.priority ? task.priority.charAt(0).toUpperCase() : null;

  return (
    <div
      className="relative group cursor-pointer"
      style={{ gridColumn: `${startCol} / span ${span}`, gridRow: row }}
      onMouseEnter={(e) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, task })}
      onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
      onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, task: null })}
      onClick={() => task.project_id
        ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } })
        : undefined}
    >
      <div
        className={`absolute inset-y-0 left-0 right-0 ${colors.pillBg} ${roundedClass} ${ml} ${mr}
                    border border-current/10 transition-all duration-200
                    hover:brightness-95 z-10 hover:z-30 flex items-center overflow-hidden box-border`}
      >
        <div className="px-2 w-full flex items-center gap-1.5 whitespace-nowrap">
          {/* Project name — muted, hidden if unresolvable */}
          {resolveProjectName(task.project_id) && (
            <span className={`font-semibold text-[10px] shrink-0 truncate max-w-[90px] ${colors.titleText} opacity-75`}>
              {resolveProjectName(task.project_id)}
            </span>
          )}
          {/* Task title — priority coloured */}
          <span className={`font-bold text-[11px] leading-tight ${colors.titleText} truncate flex-1`}>
            {task.title}
          </span>
          {/* Priority badge — pinned to far right */}
          {priorityLabel && (
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0 ml-auto ${colors.badgeBg} ${colors.badgeText}`}>
              {priorityLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Row-packing helper ──────────────────────────────────────────────────────
function buildRowMap(weekTasks, weekStart, weekEnd) {
  const rowMap = {};
  const endTimes = [];
  weekTasks.forEach(task => {
    let r = 1;
    while (r <= endTimes.length && endTimes[r - 1] >= Math.max(task.startTime, weekStart)) {
      r++;
    }
    endTimes[r - 1] = Math.min(task.deadlineTime, weekEnd);
    rowMap[task.id] = r;
  });
  return rowMap;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Calendar() {
  const { tasks, projects, loading } = useProject();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { isLoading } = useOutletContext() || {};

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [weekOffset, setWeekOffset] = useState(0); // weeks from today
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, task: null });

  // ── Full project name map (all projects, not just user’s) ──────────────────
  const [allProjectsMap, setAllProjectsMap] = useState({});
  useEffect(() => {
    fetchProjects().then(list => {
      const map = {};
      list.forEach(p => {
        const id   = p.project_id || p.id;
        const name = p.name || p.title || id;
        if (id) map[id] = name;
        if (p.name) map[p.name] = name; // also index by name for fuzzy fallback
      });
      setAllProjectsMap(map);
    }).catch(() => {});
  }, []);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ── Monthly calendar grid ─────────────────────────────────────────────────
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth  = new Date(year, month, 1).getDay();
  const daysInMonth      = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth  = new Date(year, month, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({
      date: daysInPrevMonth - firstDayOfMonth + i + 1,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ date: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
  }
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({ date: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
  }
  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) weeks.push(calendarCells.slice(i, i + 7));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // ── Weekly view: derive the week ──────────────────────────────────────────
  const today = new Date();
  const todayDay = today.getDay(); // 0 Sun … 6 Sat
  // Sunday of the current week
  const thisSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDay + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(thisSunday);
    d.setDate(thisSunday.getDate() + i);
    return d;
  });
  const weekViewStart = dayStart(weekDays[0]);
  const weekViewEnd   = dayStart(weekDays[6]) + 86400000 - 1;

  const prevWeek = () => setWeekOffset(o => o - 1);
  const nextWeek = () => setWeekOffset(o => o + 1);
  const goToday  = () => setWeekOffset(0);

  // ── Shared task computation ───────────────────────────────────────────────
  // Spanning logic: task spans from (deadline − 14 days, adjusted to prev Friday) → deadline
  const activeProjects = projects.filter(p => !p.is_archived);
  const accessibleProjectIds = new Set(activeProjects.map(p => p.id));
  const currentUsername = currentUser?.username?.toLowerCase() || '';

  const tasksWithSpans = tasks.filter(t => {
    if (!t.deadline) return false;
    if (!t.project_id || !accessibleProjectIds.has(t.project_id)) return false;
    if (!t.assigned_to || t.assigned_to.toLowerCase() !== currentUsername) return false;
    return true;
  }).map(t => {
    const datePart = t.deadline.toString().split('T')[0];
    const [y, mo, d] = datePart.split('-');
    const deadlineDate = new Date(Number(y), Number(mo) - 1, Number(d));
    const deadlineTime = dayStart(deadlineDate);

    const startDate = new Date(deadlineDate);
    startDate.setDate(startDate.getDate() - 14);
    const dow = startDate.getDay();
    const diffToFriday = dow >= 5 ? dow - 5 : dow + 2;
    startDate.setDate(startDate.getDate() - diffToFriday);
    const startTime = dayStart(startDate);

    return { ...t, startTime, deadlineTime };
  });


  // Today's tasks for sidebar
  const todayTs = dayStart(new Date());
  const todayTasks = tasksWithSpans
    .filter(t => t.startTime <= todayTs + 86400000 - 1 && t.deadlineTime >= todayTs)
    .sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (order[(a.priority || '').toUpperCase()] ?? 3) - (order[(b.priority || '').toUpperCase()] ?? 3);
    });

  const resolveProjectName = (id) => {
    if (!id) return '?';
    // 1. Direct lookup in the full unfiltered project map
    if (allProjectsMap[id]) return allProjectsMap[id];
    // 2. Case-insensitive fallback
    const lower = id.toLowerCase();
    const key = Object.keys(allProjectsMap).find(k => k.toLowerCase() === lower);
    if (key) return allProjectsMap[key];
    // 3. Fuzzy: strip non-alphanumeric and compare
    const clean = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanId = clean(id);
    const fuzzyKey = Object.keys(allProjectsMap).find(k => {
      const ck = clean(k);
      return cleanId && ck && (ck === cleanId || ck.includes(cleanId) || cleanId.includes(ck));
    });
    if (fuzzyKey) return allProjectsMap[fuzzyKey];
    // 4. Last resort: also check context projects
    const ctx = projects.find(p => p.id === id || p.name === id);
    if (ctx) return ctx.name;
    return null; // return null so we can hide it gracefully
  };

  // ── Tooltip portal ────────────────────────────────────────────────────────
  const renderTooltip = () => {
    if (!tooltip.visible || !tooltip.task) return null;
    const padding = 15;
    let x = tooltip.x + padding;
    let y = tooltip.y + padding;
    if (x + 260 > window.innerWidth)  x = tooltip.x - 260 - padding;
    if (y + 110 > window.innerHeight) y = tooltip.y - 110 - padding;

    const colors = getTaskColor(tooltip.task.priority);
    return createPortal(
      <div className="fixed z-[9999] pointer-events-none" style={{ left: x, top: y }}>
        <div className="bg-white dark:bg-gray-900/95 backdrop-blur-sm text-gray-800 dark:text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-gray-200 dark:border-white/10 w-max max-w-[260px]">
          <div className="font-semibold text-[10px] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 pb-1 mb-1.5">
            {resolveProjectName(tooltip.task.project_id)}
          </div>
          <div className="font-medium whitespace-normal break-words leading-relaxed mb-1">
            {tooltip.task.title}
          </div>
          {tooltip.task.priority && (
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}>
              {tooltip.task.priority}
            </span>
          )}
        </div>
      </div>,
      document.body
    );
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading || isLoading) {
    return (
      <div className="w-full h-full flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-[#27272A] rounded" />
          <div className="flex items-center gap-4 bg-white dark:bg-[#18181B] rounded-lg p-1 border border-gray-200 dark:border-[#27272A]">
            <div className="w-7 h-7 bg-gray-200 dark:bg-[#27272A] rounded m-1" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-[#27272A] rounded mx-2" />
            <div className="w-7 h-7 bg-gray-200 dark:bg-[#27272A] rounded m-1" />
          </div>
        </div>
        <div className="flex-1 bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A]" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MONTHLY VIEW
  // ─────────────────────────────────────────────────────────────────────────
  const renderMonthView = () => (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-[#27272A] rounded-xl border border-gray-100 dark:border-[#27272A] shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar flex flex-col">
        <div className="min-w-[900px] flex flex-col flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] z-20 shrink-0 sticky top-0">
            {days.map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider border-r border-gray-200 dark:border-[#27272A] last:border-0">
                {day}
              </div>
            ))}
          </div>

          {/* Week rows */}
          <div className="flex-1 flex flex-col">
            {weeks.map((week, weekIndex) => {
              const wStart = week[0].fullDate.getTime();
              const wEnd   = week[6].fullDate.getTime() + 86400000 - 1;

              const weekTasks = tasksWithSpans
                .filter(t => t.startTime <= wEnd && t.deadlineTime >= wStart)
                .sort((a, b) => {
                  const aS = Math.max(a.startTime, wStart);
                  const bS = Math.max(b.startTime, wStart);
                  return aS !== bS ? aS - bS : b.deadlineTime - a.deadlineTime;
                });

              const rowMap = buildRowMap(weekTasks, wStart, wEnd);

              return (
                <div key={weekIndex} className="relative min-h-[150px] flex-1 flex flex-col border-b border-gray-200 dark:border-[#27272A] last:border-0">
                  {/* Background cells — colour only, no dates */}
                  <div className="absolute inset-0 grid grid-cols-7 gap-px bg-gray-200/50 dark:bg-[#27272A]/50 pointer-events-none z-0">
                    {week.map((cell, ci) => {
                      const isToday = formatDateStr(cell.fullDate) === todayStr;
                      return (
                        <div
                          key={ci}
                          className={`transition-colors duration-300 ${
                            isToday
                              ? 'bg-[#6B905F]/10 dark:bg-[#6B905F]/20'
                              : cell.isCurrentMonth
                              ? 'bg-white dark:bg-[#18181B]'
                              : 'bg-white dark:bg-[#09090B]'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Date numbers overlay — always on top of task pills */}
                  <div className="absolute inset-0 grid grid-cols-7 gap-px pointer-events-none z-30">
                    {week.map((cell, ci) => {
                      const isToday = formatDateStr(cell.fullDate) === todayStr;
                      return (
                        <div key={ci} className="p-1.5 flex justify-end items-start">
                          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-[#6B905F] text-white shadow-sm'
                              : cell.isCurrentMonth
                              ? 'text-[#1D1E1B] dark:text-white/90'
                              : 'text-gray-400 dark:text-white/30'
                          }`}>
                            {cell.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Task spans */}
                  <div className="relative flex-1 mt-6 z-10 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="relative">
                      <div className="grid grid-cols-7 gap-x-px gap-y-1.5 py-1 px-0.5" style={{ gridAutoRows: '24px' }}>
                        {weekTasks.map(task => {
                          const startCol = task.startTime <= wStart ? 1 : new Date(task.startTime).getDay() + 1;
                          const endCol   = task.deadlineTime >= wEnd   ? 7 : new Date(task.deadlineTime).getDay() + 1;
                          const span     = Math.max(1, endCol - startCol + 1);
                          return (
                            <TaskPill
                              key={task.id}
                              task={task}
                              resolveProjectName={resolveProjectName}
                              navigate={navigate}
                              setTooltip={setTooltip}
                              startCol={startCol}
                              span={span}
                              row={rowMap[task.id]}
                              isStart={task.startTime >= wStart}
                              isEnd={task.deadlineTime <= wEnd}
                            />
                          );
                        })}
                      </div>
                      {/* Column lines — behind pills so they don't cut through text */}
                      <div className="absolute inset-0 pointer-events-none z-0">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="absolute top-0 bottom-0 w-px bg-gray-200/70 dark:bg-[#27272A]/70" style={{ left: `${(i / 7) * 100}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // WEEKLY VIEW
  // ─────────────────────────────────────────────────────────────────────────
  const renderWeekView = () => {
    const weekTasks = tasksWithSpans
      .filter(t => t.startTime <= weekViewEnd && t.deadlineTime >= weekViewStart)
      .sort((a, b) => {
        const aS = Math.max(a.startTime, weekViewStart);
        const bS = Math.max(b.startTime, weekViewStart);
        return aS !== bS ? aS - bS : b.deadlineTime - a.deadlineTime;
      });

    const rowMap = buildRowMap(weekTasks, weekViewStart, weekViewEnd);

    // Week label
    const weekLabelStart = weekDays[0].toLocaleDateString('default', { month: 'short', day: 'numeric' });
    const weekLabelEnd   = weekDays[6].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });

    const isCurrentWeek = weekOffset === 0;

    return (
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Week grid */}
        <div className="flex flex-col bg-gray-100 dark:bg-[#27272A] rounded-xl border border-gray-100 dark:border-[#27272A] shadow-sm overflow-hidden">
          {/* Week sub-header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#18181B] border-b border-gray-200 dark:border-[#27272A]">
            <div className="flex items-center gap-2">
              <button onClick={prevWeek} className="p-1 hover:bg-[#EAE5D9] dark:hover:bg-[#27272A] rounded transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {weekLabelStart} – {weekLabelEnd}
              </span>
              <button onClick={nextWeek} className="p-1 hover:bg-[#EAE5D9] dark:hover:bg-[#27272A] rounded transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            {!isCurrentWeek && (
              <button
                onClick={goToday}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#6B905F] text-white hover:bg-[#5a7a4f] transition-colors"
              >
                Today
              </button>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[700px]">
              {/* Day headers — sticky so they stay on scroll */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] sticky top-0 z-20">
                {weekDays.map((d, i) => {
                  const dStr  = formatDateStr(d);
                  const isTod = dStr === todayStr;
                  return (
                    <div key={i} className={`py-3 flex flex-col items-center border-r border-gray-200 dark:border-[#27272A] last:border-0 ${isTod ? 'bg-[#6B905F]/10 dark:bg-[#6B905F]/15' : ''}`}>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
                        {days[i]}
                      </span>
                      <span className={`mt-1 text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                        isTod ? 'bg-[#6B905F] text-white shadow-sm' : 'text-[#1D1E1B] dark:text-white/80'
                      }`}>
                        {d.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Task span rows with visible column dividers */}
              <div className={`relative bg-white dark:bg-[#18181B] ${weekTasks.length === 0 ? 'min-h-[80px]' : 'min-h-[60px]'}`}>
                {/* Column divider background */}
                {/* Column divider background */}
                <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0">
                  {weekDays.map((d, i) => (
                    <div key={i} className={`border-r border-gray-200 dark:border-[#27272A] last:border-0 ${formatDateStr(d) === todayStr ? 'bg-[#6B905F]/5 dark:bg-[#6B905F]/10' : ''}`} />
                  ))}
                </div>
                {weekTasks.length === 0 ? (
                  <div className="relative z-10 flex items-center justify-center h-20 text-xs text-gray-400 dark:text-white/30">
                    No tasks this week
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative z-10 grid grid-cols-7 gap-x-px gap-y-1.5 py-2 px-0.5" style={{ gridAutoRows: '26px' }}>
                      {weekTasks.map(task => {
                        const startCol = task.startTime <= weekViewStart ? 1 : new Date(task.startTime).getDay() + 1;
                        const endCol   = task.deadlineTime >= weekViewEnd ? 7 : new Date(task.deadlineTime).getDay() + 1;
                        const span     = Math.max(1, endCol - startCol + 1);
                        return (
                          <TaskPill
                            key={task.id}
                            task={task}
                            resolveProjectName={resolveProjectName}
                            navigate={navigate}
                            setTooltip={setTooltip}
                            startCol={startCol}
                            span={span}
                            row={rowMap[task.id]}
                            isStart={task.startTime >= weekViewStart}
                            isEnd={task.deadlineTime <= weekViewEnd}
                          />
                        );
                      })}
                    </div>
                    {/* Column lines — behind pills so they don't cut through text */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="absolute top-0 bottom-0 w-px bg-gray-200/70 dark:bg-[#27272A]/70" style={{ left: `${(i / 7) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

              </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 bg-white dark:bg-[#09090B] p-2">

      {/* ── Left Sidebar ── */}
      {view === 'week' && (
        <div className="w-full md:w-[300px] flex flex-col shrink-0">
          <MiniCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} />

          {/* Today's tasks list */}
        <div className="flex flex-col rounded-xl border border-gray-100 dark:border-[#27272A] bg-white dark:bg-[#18181B] shadow-sm overflow-hidden flex-1">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-[#27272A] bg-gray-50 dark:bg-[#18181B]">
            <div className="w-2 h-2 rounded-full bg-[#6B905F]" />
            <span className="text-xs font-bold text-[#1D1E1B] dark:text-white/90 uppercase tracking-wide">
              Today &mdash; {new Date().toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="px-4 py-6 text-xs text-gray-400 dark:text-white/30 text-center">No tasks due today.</div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50 dark:divide-[#27272A] overflow-y-auto custom-scrollbar">
              {todayTasks.map(task => {
                const colors = getTaskColor(task.priority);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#27272A]/60 cursor-pointer transition-colors"
                    onClick={() => task.project_id
                      ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } })
                      : undefined}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                    <div className="flex flex-col flex-1 min-w-0">
                      {resolveProjectName(task.project_id) && (
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-white/50 shrink-0 truncate max-w-[120px]">
                          {resolveProjectName(task.project_id)}
                        </span>
                      )}
                      <span className="text-[12px] font-semibold text-[#1D1E1B] dark:text-white/80 truncate leading-tight">
                        {task.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">
              {view === 'month' ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) : 'This Week'}
            </h1>

            {/* Month/Week nav arrows */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#18181B] rounded-lg p-1 border border-gray-200 dark:border-[#27272A] shadow-sm">
              <button
                onClick={view === 'month' ? prevMonth : prevWeek}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={view === 'month' ? nextMonth : nextWeek}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-[#18181B] rounded-lg p-1 border border-gray-200 dark:border-[#27272A]">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 ${
                view === 'month'
                  ? 'bg-white dark:bg-[#27272A] text-[#1D1E1B] dark:text-white/90 shadow-sm'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 ${
                view === 'week'
                  ? 'bg-white dark:bg-[#27272A] text-[#1D1E1B] dark:text-white/90 shadow-sm'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        
        {/* Priority legend */}
        <div className="flex items-center gap-4 mb-4">
          {Object.entries(PRIORITY_COLORS).filter(([k]) => k !== '_DEFAULT').map(([label, c]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className={`text-[11px] font-semibold ${c.titleText} capitalize`}>{label.toLowerCase()}</span>
            </div>
          ))}
        </div>

        {/* View content */}
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>

      {renderTooltip()}
    </div>
  );
}
