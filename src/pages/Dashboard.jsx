import { FolderOpen, AlertCircle, PlayCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const mockTasks = [
    { id: 1, title: 'Finalize Database Schema', project: 'Project Orchestra', status: 'stopped', deadline: '2026-06-01' },
    { id: 2, title: 'Fix Auth Bugs', project: 'Project Orchestra', status: 'stopped', deadline: '2026-06-03' },
    { id: 3, title: 'Implement Kanban Board', project: 'General', status: 'in_progress', deadline: '2026-06-05' },
    { id: 4, title: 'Review Marketing Copy', project: 'Project Marketing', status: 'in_progress', deadline: '2026-06-07' },
    { id: 5, title: 'Client Feedback Sync', project: 'Project Marketing', status: 'in_progress', deadline: '2026-06-08' },
  ];

  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const delayedTasks = sortTasks(mockTasks.filter(t => t.status === 'stopped' || t.status === 'delayed')).slice(0, 3);
  const inProgressTasks = sortTasks(mockTasks.filter(t => t.status === 'in_progress')).slice(0, 3);

  const TaskCard = ({ task, colorClass }) => (
    <div 
      onClick={() => navigate('/todo')}
      className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{task.title}</h3>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-600">
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
    <div className="max-w-[1400px] mx-auto h-full">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-gray-900 text-lg font-bold mb-1">Welcome back, {currentUser?.name || "Guest"}</h1>
        <p className="text-gray-500 text-sm">Here's what's happening with your projects today.</p>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Projects Overview */}
        <div className="flex flex-col gap-6">
          {/* Active Projects Stat Box */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col justify-center transition-all hover:border-[#4A90E2]/30 hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 font-medium">Active Projects</span>
              <div className="w-10 h-10 bg-[#4A90E2]/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[#4A90E2]" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900">2</div>
            <div className="text-sm text-gray-500 mt-2">Currently being tracked</div>
          </div>

          {/* Individual Projects Grid */}
          <div className="flex-1">
            <h2 className="text-gray-900 font-bold mb-3 text-sm">Your Projects</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Project Marketing Card */}
              <button
                onClick={() => navigate('/proj_marketing-tasks')}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 text-left flex flex-col items-center justify-center aspect-square group"
              >
                <div className="w-10 h-10 bg-[#4A90E2]/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-5 h-5 text-[#4A90E2]" />
                </div>
                <h3 className="text-gray-900 font-semibold text-xs text-center line-clamp-2 px-2">Project Marketing</h3>
              </button>

              {/* Project Orchestra Card */}
              <button
                onClick={() => navigate('/proj_orchestra-tasks')}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 text-left flex flex-col items-center justify-center aspect-square group"
              >
                <div className="w-10 h-10 bg-[#9B59B6]/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-5 h-5 text-[#9B59B6]" />
                </div>
                <h3 className="text-gray-900 font-semibold text-xs text-center line-clamp-2 px-2">Project Orchestra</h3>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Behind Tasks Widget */}
        <div className="flex flex-col bg-gray-50/50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner h-full">
          <div className="p-3 border-b-2 border-gray-200 bg-gray-100 flex items-center gap-2 sticky top-0 z-10">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-gray-700 text-sm">Behind / Delayed</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {delayedTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-red-50 border-red-200" />)}
          </div>
        </div>

        {/* Right Column: In Progress Tasks Widget */}
        <div className="flex flex-col bg-gray-50/50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner h-full">
          <div className="p-3 border-b-2 border-gray-200 bg-gray-100 flex items-center gap-2 sticky top-0 z-10">
            <PlayCircle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-gray-700 text-sm">In Progress</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {inProgressTasks.map(task => <TaskCard key={task.id} task={task} colorClass="bg-amber-50 border-amber-200" />)}
          </div>
        </div>

      </div>
    </div>
  );
}
