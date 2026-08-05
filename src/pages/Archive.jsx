import { Archive as ArchiveIcon, FolderOpen, RefreshCw, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Archive() {
  const { projects, archiveProject, deleteProject } = useProject();
  const archivedProjects = projects.filter(p => p.is_archived);
  const navigate = useNavigate();
  
  const [projectToDelete, setProjectToDelete] = useState(null);

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gray-100 dark:bg-[#1E1E22] rounded-full flex items-center justify-center">
          <ArchiveIcon className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1D1E1B] dark:text-white/90">Archive</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">View and restore your archived projects.</p>
        </div>
      </div>

      {archivedProjects.length === 0 ? (
        <div className="bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-dashed border-gray-300 dark:border-[#27272A] p-12 flex flex-col items-center justify-center text-center">
          <ArchiveIcon className="w-12 h-12 text-gray-400 dark:text-white/40 mb-4 opacity-50" />
          <h3 className="text-[#1D1E1B] dark:text-white/90 font-medium text-lg mb-2">No archived projects</h3>
          <p className="text-sm text-gray-500 dark:text-white/50">When you archive a project, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {archivedProjects.map(project => (
            <div key={project.id} className="bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] p-5 flex flex-col relative group transition-all hover:shadow-md hover:border-[#6B905F]/50">
              <button 
                onClick={() => navigate(`/project/${project.id}/workflow`)} 
                className="flex items-center gap-3 mb-5 text-left w-full cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color}15` }}>
                  <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
                </div>
                <h3 className="font-semibold text-sm text-[#1D1E1B] dark:text-white/90 truncate">{project.name}</h3>
              </button>
              
              <div className="mt-auto flex gap-2">
                {project.isCreator ? (
                  <>
                    <button
                      onClick={() => archiveProject(project.id, false)}
                      className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-[#6B905F] hover:bg-[#5A7A4F] text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="px-3 py-1.5 flex items-center justify-center bg-gray-200 dark:bg-[#1E1E22] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:text-white/70 dark:hover:text-red-400 text-gray-600 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-[10px] text-gray-500 italic mt-2">
                    View-only (Requires creator permissions to manage)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1E1B] dark:text-white/90 mb-2">Delete Project?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">"{projectToDelete.name}"</span>? This action cannot be undone and all associated tasks and data will be permanently removed.
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
