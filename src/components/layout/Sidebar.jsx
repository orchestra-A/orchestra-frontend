import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Inbox, Archive, Home, Calendar, Settings, Users, Clover, Plug, Trash2, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useProject } from '../../context/ProjectContext';

// Main Navigation Sidebar
// Supports collapsing/expanding on hover, and dynamically renders the list of active projects.
export function Sidebar({ sidebarCollapsed, setSidebarCollapsed, isHoveringSidebar, setIsHoveringsidebar }) {
  // Local state for the currently expanded project folder in the sidebar
  const [expandedProject, setExpandedProject] = useState('proj_marketing');
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const navigate = useNavigate();
  const { projects, deleteProject } = useProject();
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Delete project handler - redirects to home if the currently viewed project is deleted
  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      if (location.pathname.includes(projectToDelete.id)) {
        navigate('/');
      }
    }
  };

  const handleSidebarInteraction = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  const isSidebarExpanded = !sidebarCollapsed || isHoveringSidebar;

  const getIsActive = (path) => {
    if (path === 'dashboard' && location.pathname === '/') return true;
    return location.pathname.includes(path);
  }

  return (
    <div
      className={`${isSidebarExpanded ? 'w-48' : 'w-14'} bg-[#F4F1EB] dark:bg-[#121910] text-[#1D1E1B] dark:text-white flex flex-col transition-all duration-300 border-r border-[#2B3B26] h-screen shrink-0`}
      onMouseEnter={() => setIsHoveringsidebar(true)}
      onMouseLeave={() => setIsHoveringsidebar(false)}
    >
      {/* Sidebar Header */}
      <div className={`h-16 flex items-center border-b border-white/5 shrink-0 ${isSidebarExpanded ? 'px-4 justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#51DD15] dark:text-[#51DD15]" />
          {isSidebarExpanded && <span className="font-medium text-[15px]">Orchestra</span>}
        </div>
        {isSidebarExpanded && !sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1.5 hover:bg-[#6B905F] dark:bg-[#6B905F]/5 rounded-md transition-colors ml-auto shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-[#1D1E1B]" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {/* Home Button */}
        <NavLink
          to="/"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] mb-2 ${isActive
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-[#51DD15] dark:text-[#51DD15] font-medium'
            : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
            }`}
          title={!isSidebarExpanded ? 'Home' : ''}
        >
          <Home className="w-4 h-4" />
          {isSidebarExpanded && 'Home'}
        </NavLink>

        {/* Divider */}
        <div className="h-px bg-[#6B905F] dark:bg-[#6B905F]/5 my-3"></div>

        {/* Projects Label */}
        {isSidebarExpanded && (
          <div className="px-3 py-2 text-[11px] text-[#1D1E1B] dark:text-white/90 uppercase tracking-wider font-medium">
            Projects
          </div>
        )}

        {/* Projects */}
        {projects.map((project) => (
          <div key={project.id}>
            <button
              onClick={() => {
                handleSidebarInteraction();
                setExpandedProject(expandedProject === project.id ? null : project.id);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 transition-colors group relative"
              title={!isSidebarExpanded ? project.name : ''}
            >
              {isSidebarExpanded && <span className="text-[13px] text-[#1D1E1B] font-medium dark:text-white/90 truncate mr-6">{project.name}</span>}
              {!isSidebarExpanded && <span className="text-base font-semibold text-[#1D1E1B] dark:text-white/90">{project.name.charAt(0)}</span>}

              {isSidebarExpanded && (
                <div className="absolute right-2 flex items-center gap-1 bg-transparent group-hover:bg-[#6B905F]/10 dark:group-hover:bg-white/10 transition-colors rounded-md p-0.5">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                    }}
                    className="p-1 rounded-md text-[#1D1E1B]/50 dark:text-white/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Project"
                  >
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-[#1D1E1B]/70 dark:text-white/70 transition-transform ${expandedProject === project.id ? 'rotate-90' : ''}`}
                  />
                </div>
              )}
            </button>

            {isSidebarExpanded && expandedProject === project.id && project.items.length > 0 && (
              <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
                {project.items.map((item) => {
                  const path = `project/${project.id}/${item.toLowerCase()}`;
                  return (
                    <NavLink
                      key={item}
                      to={`/${path}`}
                      className={({ isActive }) => `w-full flex text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${isActive
                        ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-[#51DD15] dark:text-[#51DD15] font-medium'
                        : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
                        }`}
                    >
                      {item}
                    </NavLink>
                  )
                })}
                <NavLink
                  to={`/blueprint/${project.id}`}
                  className={({ isActive }) => `w-full flex text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${isActive
                    ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-[#51DD15] dark:text-[#51DD15] font-medium'
                    : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
                    }`}
                >
                  Modify
                </NavLink>
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="h-px bg-[#6B905F] dark:bg-[#6B905F]/5 my-3"></div>



        {/* Other Nav Items */}
        <NavLink
          to="/todo"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-[#51DD15] dark:text-[#51DD15] font-medium'
            : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
            }`}
          title={!isSidebarExpanded ? 'To Do' : ''}
        >
          <Inbox className="w-4 h-4" />
          {isSidebarExpanded && (
            <span className="flex-1 text-left">To Do</span>
          )}
          {isSidebarExpanded && (
            <Badge variant="secondary" className="bg-[#F59E42]/20 text-[#F59E42] border-0 text-[10px] px-1.5 h-5">
              12
            </Badge>
          )}
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-[#51DD15] dark:text-[#51DD15] font-medium'
            : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
            }`}
          title={!isSidebarExpanded ? 'Calendar' : ''}
        >
          <Calendar className="w-4 h-4" />
          {isSidebarExpanded && 'Calendar'}
        </NavLink>

        <NavLink
          to="/archive"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-[#51DD15] dark:text-[#51DD15] font-medium'
            : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
            }`}
          title={!isSidebarExpanded ? 'Archive' : ''}
        >
          <Archive className="w-4 h-4" />
          {isSidebarExpanded && 'Archive'}
        </NavLink>

      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F1EB] dark:bg-[#121910] border border-gray-200 dark:border-[#2B3B26] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1E1B] dark:text-white mb-2">Delete Project?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-bold text-[#6B905F] dark:text-[#6B905F]">"{projectToDelete.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#2B3B26] hover:bg-gray-300 dark:hover:bg-[#2B3B26] text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors cursor-pointer"
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
