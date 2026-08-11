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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to format date for comparison
  const formatDateStr = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = formatDateStr(new Date());

  // Filter and group tasks by deadline
  // Safely extracts YYYY-MM-DD from the database date string to avoid timezone shifts
  const getTasksForDate = (dateObj) => {
    const targetDateStr = formatDateStr(dateObj);
    return tasks.filter(t => {
      if (!t.deadline) return false;
      const datePart = t.deadline.toString().split('T')[0];
      return datePart === targetDateStr;
    });
  };

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
          <div className="flex-1 grid grid-cols-7 bg-gray-200 dark:bg-[#27272A] gap-px overflow-y-auto">
            {Array.from({ length: 35 }).map((_, i) => {
              const isCurrentMonth = i >= 3 && i < 33;
              return (
                <div key={i} className={`min-h-[120px] p-2 flex flex-col ${isCurrentMonth ? 'bg-[#F4F1EB] dark:bg-[#18181B]' : 'bg-[#F3F7F1] dark:bg-[#09090B]'}`}>
                  <div className="flex justify-end mb-1">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-[#27272A] rounded-full"></div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {i === 12 || i === 18 ? (
                      <div className="p-1.5 rounded bg-sky-50 dark:bg-sky-950/30 border-l-2 border-l-sky-500">
                        <div className="h-3 w-3/4 bg-sky-200 dark:bg-sky-800/40 rounded mb-1"></div>
                        <div className="h-2 w-1/2 bg-sky-200 dark:bg-sky-800/40 rounded"></div>
                      </div>
                    ) : i === 24 ? (
                      <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/30 border-l-2 border-l-red-500">
                        <div className="h-3 w-3/4 bg-red-200 dark:bg-red-800/40 rounded mb-1"></div>
                        <div className="h-2 w-1/2 bg-red-200 dark:bg-red-800/40 rounded"></div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
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

      <div className="flex-1 flex flex-col bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] shadow-sm overflow-hidden">
        {/* Header Days */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#27272A] bg-[#F3F7F1] dark:bg-[#18181B]">
          {days.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider border-r border-gray-200 dark:border-[#27272A] last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 bg-gray-200 dark:bg-[#27272A] gap-px overflow-y-auto">
          {calendarCells.map((cell, i) => {
            const dateStr = formatDateStr(cell.fullDate);
            const isToday = dateStr === todayStr;
            const dayTasks = getTasksForDate(cell.fullDate);

            return (
              <div 
                key={i} 
                className={`min-h-[120px] p-2 flex flex-col ${cell.isCurrentMonth ? 'bg-[#F4F1EB] dark:bg-[#18181B]' : 'bg-[#F3F7F1] dark:bg-[#09090B]'}`}
              >
                <div className="flex justify-end mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-[#6B905F] text-white' : 
                      cell.isCurrentMonth ? 'text-[#1D1E1B] dark:text-white/90' : 'text-gray-400 dark:text-white/30'}`}
                  >
                    {cell.date}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {dayTasks.map(task => {
                    const colors = getStatusColor(task.status);
                    return (
                      <div 
                        key={task.id}
                        onClick={() => task.project_id ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } }) : undefined}
                        className={`${colors.bg} border border-transparent border-l-4 ${colors.border} rounded-md p-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-1`}
                        title={`${task.title}\nProject: ${resolveProjectName(task.project_id)}`}
                      >
                        <div className={`font-semibold text-[10px] sm:text-[11px] leading-tight ${colors.text} truncate`}>
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-[9px] font-medium opacity-80 ${colors.text} truncate max-w-[80%]`}>
                            {resolveProjectName(task.project_id)}
                          </div>
                          {task.priority && (
                            <div className={`text-[8px] uppercase font-bold px-1 rounded-sm bg-black/5 dark:bg-white/10 ${colors.text}`}>
                              {task.priority.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
