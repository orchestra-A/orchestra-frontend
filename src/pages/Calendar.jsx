import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function Calendar() {
  const { tasks, projects, loading } = useProject();
  const navigate = useNavigate();
  const { isLoading } = useOutletContext() || {};
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Basic calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build the grid array
  const calendarCells = [];
  
  // Previous month overflow
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({
      date: daysInPrevMonth - firstDayOfMonth + i + 1,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1)
    });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i)
    });
  }
  
  // Next month overflow to complete the grid (usually 42 cells total for 6 rows)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, i)
    });
  }

  // Chunk cells into weeks
  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to format date for comparison
  const formatDateStr = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = formatDateStr(new Date());

  // Pre-calculate task spans to avoid redundant date math
  const tasksWithSpans = tasks.filter(t => t.deadline).map(t => {
    const datePart = t.deadline.toString().split('T')[0];
    const parts = datePart.split('-');
    const deadlineDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const deadlineTime = deadlineDate.getTime();

    const startDate = new Date(deadlineDate);
    startDate.setDate(startDate.getDate() - 14);
    const dayOfWeek = startDate.getDay();
    // Friday is 5. Go backwards to Friday.
    const diffToFriday = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2;
    startDate.setDate(startDate.getDate() - diffToFriday);
    const startTime = startDate.getTime();

    return { ...t, startTime, deadlineTime };
  });

  const resolveProjectName = (taskProjectId) => {
    if (!taskProjectId) return 'Unknown Project';
    const match = projects.find(p => p.id === taskProjectId);
    return match ? match.name : taskProjectId;
  };

  const getStatusColor = (status) => {
    const s = (status || 'todo').toLowerCase();
    if (['stopped', 'delayed', 'blocked', 'paused', 'error'].includes(s)) {
      return { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-l-red-500', text: 'text-red-700 dark:text-red-300' };
    }
    if (s === 'in_progress') {
      return { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-l-amber-500', text: 'text-amber-700 dark:text-amber-300' };
    }
    if (['completed', 'done', 'finished'].includes(s)) {
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-l-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' };
    }
    // Default (Upcoming/Todo)
    return { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-l-sky-500', text: 'text-sky-700 dark:text-sky-300' };
  };

  if (loading || isLoading) {
    return (
      <div className="w-full h-full flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-[#27272A] rounded"></div>
          
          <div className="flex items-center gap-4 bg-[#F4F1EB] dark:bg-[#18181B] rounded-lg p-1 border border-gray-200 dark:border-[#27272A]">
            <div className="w-7 h-7 bg-gray-200 dark:bg-[#27272A] rounded m-1"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-[#27272A] rounded mx-2"></div>
            <div className="w-7 h-7 bg-gray-200 dark:bg-[#27272A] rounded m-1"></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#27272A] bg-[#F3F7F1] dark:bg-[#18181B]">
            {days.map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider border-r border-gray-200 dark:border-[#27272A] last:border-0">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 bg-gray-200 dark:bg-[#27272A] opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">Calendar</h1>
        
        <div className="flex items-center gap-4 bg-[#F4F1EB] dark:bg-[#18181B] rounded-lg p-1 border border-gray-200 dark:border-[#27272A]">
          <button onClick={prevMonth} className="p-1 hover:bg-[#EAE5D9] dark:hover:bg-[#27272A] rounded">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="font-semibold text-sm min-w-[120px] text-center text-[#1D1E1B] dark:text-white/90">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-[#EAE5D9] dark:hover:bg-[#27272A] rounded">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-200 dark:bg-[#27272A] rounded-lg border border-gray-200 dark:border-[#27272A] shadow-sm overflow-hidden">
        {/* Header Days */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#27272A] bg-[#F3F7F1] dark:bg-[#18181B] z-10 shrink-0">
          {days.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider border-r border-gray-200 dark:border-[#27272A] last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid (Week Rows) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {weeks.map((week, weekIndex) => {
            // Find tasks that overlap with this week
            const weekStart = week[0].fullDate.getTime();
            const weekEnd = week[6].fullDate.getTime() + 86400000 - 1; // End of Saturday

            const weekTasks = tasksWithSpans.filter(t => t.startTime <= weekEnd && t.deadlineTime >= weekStart);
            
            // Sort to ensure stable packing
            weekTasks.sort((a, b) => {
              const aStart = Math.max(a.startTime, weekStart);
              const bStart = Math.max(b.startTime, weekStart);
              if (aStart !== bStart) return aStart - bStart;
              return b.deadlineTime - a.deadlineTime; // Longest first
            });

            // Assign rows
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

            return (
              <div key={weekIndex} className="relative min-h-[120px] flex-1 flex flex-col border-b border-gray-200 dark:border-[#27272A] last:border-0">
                {/* Background Grid Cells */}
                <div className="absolute inset-0 grid grid-cols-7 gap-px bg-gray-200 dark:bg-[#27272A] pointer-events-none">
                  {week.map((cell, cellIndex) => {
                    const dateStr = formatDateStr(cell.fullDate);
                    const isToday = dateStr === todayStr;

                    return (
                      <div 
                        key={cellIndex} 
                        className={`p-2 flex flex-col ${cell.isCurrentMonth ? 'bg-[#F4F1EB] dark:bg-[#18181B]' : 'bg-[#F3F7F1] dark:bg-[#09090B]'}`}
                      >
                        <div className="flex justify-end mb-1">
                          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-[#6B905F] text-white' : 
                              cell.isCurrentMonth ? 'text-[#1D1E1B] dark:text-white/90' : 'text-gray-400 dark:text-white/30'}`}
                          >
                            {cell.date}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Foreground Task Spans */}
                <div className="relative flex-1 mt-8 mb-2 pr-1 z-10 overflow-y-auto custom-scrollbar">
                  <div 
                    className="grid grid-cols-7 gap-x-px gap-y-1"
                    style={{ gridAutoRows: '42px' }}
                  >
                    {weekTasks.map(task => {
                      const colors = getStatusColor(task.status);
                      
                      const startCol = task.startTime <= weekStart 
                        ? 1 
                        : new Date(task.startTime).getDay() + 1;
                        
                      const endCol = task.deadlineTime >= weekEnd 
                        ? 7 
                        : new Date(task.deadlineTime).getDay() + 1;

                      const span = endCol - startCol + 1;
                      const isStart = task.startTime >= weekStart;
                      const isEnd = task.deadlineTime <= weekEnd;

                      let roundedClass = 'rounded-none';
                      if (isStart && isEnd) roundedClass = 'rounded-md';
                      else if (isStart) roundedClass = 'rounded-l-md rounded-r-none';
                      else if (isEnd) roundedClass = 'rounded-r-md rounded-l-none';

                      let marginClass = '';
                      if (isStart) marginClass += 'ml-1';
                      if (isEnd) marginClass += 'mr-1';

                      let borderClass = isStart ? `border-l-4 ${colors.border}` : '';

                      return (
                        <div 
                          key={task.id}
                          onClick={() => task.project_id ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } }) : undefined}
                          className={`shrink-0 ${colors.bg} ${roundedClass} ${marginClass} ${borderClass} shadow-sm transition-all cursor-pointer hover:shadow-md group flex flex-col justify-center overflow-hidden box-border`}
                          style={{ 
                            gridColumn: `${startCol} / span ${span}`,
                            gridRow: rowMap[task.id]
                          }}
                          title={`${task.title}\nProject: ${resolveProjectName(task.project_id)}`}
                        >
                          <div className="px-2 w-full flex items-center gap-1.5 overflow-hidden">
                            <div className={`font-semibold text-xs opacity-75 ${colors.text} shrink-0 truncate max-w-[40%]`}>
                              [{resolveProjectName(task.project_id)}]
                            </div>
                            <div className={`font-bold text-sm leading-tight ${colors.text} truncate flex-1`}>
                              {task.title}
                            </div>
                            {task.priority && (
                              <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 ${colors.text} shrink-0 ml-auto`}>
                                {task.priority.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
