import { FolderOpen, Inbox, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useState } from 'react';
import { Trash2, X } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { projects, deleteProject } = useProject();
  
  const [projectToDelete, setProjectToDelete] = useState(null);

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

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
          <div className="text-2xl font-semibold text-gray-900">{projects.length}</div>
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
        {/* Dynamic Project Cards */}
        {projects.map(project => (
          <div key={project.id} className="relative group">
            <button
              onClick={() => navigate(`/${project.id}-tasks`)}
              className="w-full text-left cursor-pointer h-full"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}15` }}>
                    <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{project.taskCount} tasks</span>
                  <span>{project.memberCount} members</span>
                </div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProjectToDelete(project);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-white border border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-200 hover:bg-red-50 z-10"
              title="Delete Project"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* New Project Card */}
        <button onClick={() => navigate('/blueprint')} className="group cursor-pointer text-left h-full">
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 shadow-sm transition-all hover:border-[#4A90E2] hover:bg-gray-50 flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Create New Project</span>
          </div>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 page-enter">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{projectToDelete.name}"</span>? This action cannot be undone and all associated tasks and data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
