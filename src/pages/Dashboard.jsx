import { FolderOpen, Inbox, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-gray-900 text-2xl font-bold mb-2">Welcome back, {currentUser?.name || "Guest"}</h1>
        <p className="text-gray-500">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Active Projects</span>
            <FolderOpen className="w-4 h-4 text-[#4A90E2]" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">2</div>
        </div>
        <button
          onClick={() => navigate('/todo')}
          className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:border-[#4A90E2]/30 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">To Do</span>
            <Inbox className="w-4 h-4 text-[#F59E42]" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">12</div>
        </button>
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <h2 className="text-gray-900 text-xl font-bold mb-4">Projects</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* Project 1 Card */}
        <button
          onClick={() => navigate('/project1-tasks')}
          className="group cursor-pointer text-left"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-[#4A90E2]/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[#4A90E2]" />
              </div>
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">Project 1</h3>
            <p className="text-sm text-gray-500 mb-4">Marketing campaign redesign and implementation</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>8 tasks</span>
              <span>4 members</span>
            </div>
          </div>
        </button>

        {/* Project 2 Card */}
        <button
          onClick={() => navigate('/project2-tasks')}
          className="group cursor-pointer text-left"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-[#9B59B6]/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[#9B59B6]" />
              </div>
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">Project 2</h3>
            <p className="text-sm text-gray-500 mb-4">Mobile app development and testing phase</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>12 tasks</span>
              <span>6 members</span>
            </div>
          </div>
        </button>

        {/* New Project Card */}
        <button className="group cursor-pointer text-left h-full">
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 shadow-sm transition-all hover:border-[#4A90E2] hover:bg-gray-50 flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Create New Project</span>
          </div>
        </button>
      </div>

    </div>
  );
}
