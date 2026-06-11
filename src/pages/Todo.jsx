import { Clock, AlertCircle, PlayCircle, CalendarClock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function Todo() {
  const { tasks, projects } = useProject();
  const { currentUser } = useAuth();

  const myTasks = tasks.filter(t => t.assigned_to === (currentUser?.name || "Guest"));

  const delayedTasks = myTasks.filter(t => t.status === 'stopped' || t.status === 'delayed');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const upcomingTasks = myTasks.filter(t => t.status === 'todo' || t.status === 'upcoming');

  const TaskCard = ({ task, colorClass }) => {
    const projectName = projects.find(p => p.id === task.project_id)?.name || task.project_id || 'General';
    return (
      <div className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-[#1D1E1B] text-sm leading-snug">{task.title}</h3>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-600 border-none">
            {projectName}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">My Tasks</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-6">
        {/* Column 1: Behind/Delayed/Stopped */}
        <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#1A1E2E] rounded-xl border-2 border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-inner">
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#2A3142] bg-gray-100 dark:bg-[#141824] flex items-center gap-2 sticky top-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Behind / Delayed / Stopped</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#2A3142] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{delayedTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {delayedTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-red-200 border-red-300" />)}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#1A1E2E] rounded-xl border-2 border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-inner">
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#2A3142] bg-gray-100 dark:bg-[#141824] flex items-center gap-2 sticky top-0">
            <PlayCircle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">In Progress</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#2A3142] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {inProgressTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-amber-200 border-amber-300" />)}
          </div>
        </div>

        {/* Column 3: Upcoming */}
        <div className="flex flex-col bg-[#F3F7F1]/50 dark:bg-[#1A1E2E] rounded-xl border-2 border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-inner">
          <div className="p-3 border-b-2 border-gray-200 dark:border-[#2A3142] bg-gray-100 dark:bg-[#141824] flex items-center gap-2 sticky top-0">
            <CalendarClock className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-gray-700 dark:text-white/70 text-sm">Upcoming</h2>
            <span className="ml-auto bg-gray-200 dark:bg-[#2A3142] text-gray-700 dark:text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">{upcomingTasks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {upcomingTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-blue-200 border-blue-300" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
