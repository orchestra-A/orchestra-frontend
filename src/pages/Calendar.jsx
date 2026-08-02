import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Calendar() {
  const { tasks, projects } = useProject();
  const navigate = useNavigate();
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
                  {dayTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => task.project_id ? navigate(`/project/${task.project_id}/workflow`, { state: { selectedTaskId: task.id } }) : undefined}
                      className="bg-white dark:bg-[#27272A] border border-gray-200 dark:border-gray-700 rounded p-1.5 shadow-sm text-xs group relative hover:z-10 hover:shadow-md transition-all cursor-pointer"
                      title={`${task.title}\nProject: ${resolveProjectName(task.project_id)}`}
                    >
                      <div className="font-medium text-[#1D1E1B] dark:text-white/90 truncate">
                        {task.title}
                      </div>
                      <div className="text-[9px] text-[#6B905F] dark:text-[#7ED957] truncate mt-0.5 font-semibold">
                        {resolveProjectName(task.project_id)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
