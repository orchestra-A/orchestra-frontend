import { Clock, AlertCircle, PlayCircle, CalendarClock } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function Todo() {
  const mockTasks = [
    { id: 1, title: 'Finalize Database Schema', project: 'Project Orchestra', status: 'stopped', deadline: '2026-06-01' },
    { id: 2, title: 'Fix Auth Bugs', project: 'Project Orchestra', status: 'stopped', deadline: '2026-06-03' },
    { id: 3, title: 'Implement Kanban Board', project: 'General', status: 'in_progress', deadline: '2026-06-05' },
    { id: 4, title: 'Review Marketing Copy', project: 'Project Marketing', status: 'in_progress', deadline: '2026-06-07' },
    { id: 5, title: 'Prepare Q3 Roadmap Slides', project: 'General', status: 'todo', deadline: '2026-06-10' },
    { id: 6, title: 'Update Dependencies', project: 'Project 2', status: 'todo', deadline: '2026-06-15' },
    { id: 7, title: 'Onboard New Developer', project: 'Project Orchestra', status: 'todo', deadline: '2026-06-12' },
  ];

  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const delayedTasks = sortTasks(mockTasks.filter(t => t.status === 'stopped' || t.status === 'delayed'));
  const inProgressTasks = sortTasks(mockTasks.filter(t => t.status === 'in_progress'));
  const upcomingTasks = sortTasks(mockTasks.filter(t => t.status === 'todo' || t.status === 'upcoming'));

  const TaskCard = ({ task, colorClass }) => (
    <div className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{task.title}</h3>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-600 border-none">
          {task.project}
        </Badge>
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          <Clock className="w-3 h-3" />
          <span>{task.deadline}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">My Tasks</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-6">
        {/* Column 1: Behind/Delayed/Stopped */}
        <div className="flex flex-col bg-gray-50/50 dark:bg-[#1A1E2E] rounded-xl border-2 border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-inner">
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
        <div className="flex flex-col bg-gray-50/50 dark:bg-[#1A1E2E] rounded-xl border-2 border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-inner">
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
        <div className="flex flex-col bg-gray-50/50 dark:bg-[#1A1E2E] rounded-xl border-2 border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-inner">
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
