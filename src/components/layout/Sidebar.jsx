import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Inbox, Archive, Home, Calendar, Settings, Users, Clover, Plug, Trash2, X, MoreVertical } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useProject } from '../../context/ProjectContext';

import { useAuth } from '../../context/AuthContext';

// Main Navigation Sidebar
// Supports collapsing/expanding on hover, and dynamically renders the list of active projects.
export function Sidebar({ sidebarCollapsed, setSidebarCollapsed, isHoveringSidebar, setIsHoveringsidebar }) {
  // Local state for the currently expanded project folder in the sidebar
  const [expandedProject, setExpandedProject] = useState('proj_marketing');
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const navigate = useNavigate();
  const { projects, tasks, deleteProject, archiveProject } = useProject();
  const { currentUser } = useAuth();
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToArchive, setProjectToArchive] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const activeProjects = projects.filter(p => !p.is_archived);
  const archivedProjects = projects.filter(p => p.is_archived);
  const activeArchivedProject = archivedProjects.find(p => location.pathname.includes(p.id));

  useEffect(() => {
    if (activeArchivedProject && expandedProject !== activeArchivedProject.id) {
      setExpandedProject(activeArchivedProject.id);
    }
  }, [activeArchivedProject, expandedProject]);

  // Dynamic count of all non-completed tasks across the user's projects
  // Task project_ids are normalized to canonical IDs by ProjectContext
  const projectIds = new Set(activeProjects.map(p => p.id));
  const myTasksCount = (tasks || []).filter(t => {
    if (!t.project_id || t.status === 'completed') return false;
    return projectIds.has(t.project_id);
  }).length;

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

  const confirmArchive = () => {
    if (projectToArchive) {
      archiveProject(projectToArchive.id, true);
      setProjectToArchive(null);
    }
  };

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.project-dropdown-container')) {
      setDropdownOpenId(null);
    }
  });

  const handleSidebarInteraction = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  const isSidebarExpanded = !sidebarCollapsed || isHoveringSidebar;

  useEffect(() => {
    console.log(`[App Action] Sidebar expanded state changed to: ${isSidebarExpanded}`);
  }, [isSidebarExpanded]);

  const getIsActive = (path) => {
    if (path === 'dashboard' && location.pathname === '/') return true;
    return location.pathname.includes(path);
  }

  const renderProjectList = (projectList) => (
    projectList.map((project) => (
      <div key={project.id} className="relative project-dropdown-container">
        <button
          onClick={() => {
            setExpandedProject(expandedProject === project.id ? null : project.id);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 transition-colors group relative"
          title={!isSidebarExpanded ? project.name : ''}
        >
          {isSidebarExpanded && <span className="text-[13px] text-[#1D1E1B] font-medium dark:text-white/90 truncate mr-6">{project.name}</span>}
          {!isSidebarExpanded && <span className="text-base font-semibold text-[#1D1E1B] dark:text-white/90">{project.name.charAt(0)}</span>}

          {isSidebarExpanded && (
            <div className="absolute right-2 flex items-center gap-1 bg-transparent group-hover:bg-[#6B905F]/10 dark:group-hover:bg-white/10 transition-colors rounded-md p-0.5">
              {project.isCreator && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpenId(dropdownOpenId === project.id ? null : project.id);
                  }}
                  className="p-1 rounded-md text-[#1D1E1B]/50 dark:text-white/50 hover:text-[#1D1E1B] hover:bg-[#6B905F]/10 dark:hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </div>
              )}
              <ChevronRight
                className={`w-4 h-4 text-[#1D1E1B]/70 dark:text-white/70 transition-transform ${expandedProject === project.id ? 'rotate-90' : ''}`}
              />
            </div>
          )}
        </button>

        {dropdownOpenId === project.id && (
          <div className="absolute right-8 top-8 w-32 bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-[#27272A] rounded-md shadow-lg z-50 py-1 flex flex-col">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (project.is_archived) {
                  archiveProject(project.id, false);
                } else {
                  setProjectToArchive(project);
                }
                setDropdownOpenId(null);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-[#1D1E1B] dark:text-white/90 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {project.is_archived ? "Restore" : "Archive"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProjectToDelete(project);
                setDropdownOpenId(null);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        )}

        {isSidebarExpanded && expandedProject === project.id && project.items.length > 0 && (
          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
            {project.items.map((item) => {
              const targetPath = item === 'Modify'
                ? `/blueprint/${project.id}`
                : `/project/${project.id}/${item.toLowerCase()}`;
                
              const isTasks = item === 'Tasks';
              const showSubPage = isTasks && location.pathname === targetPath && location.state?.assignee;

              return (
                <div key={item}>
                  <NavLink
                    to={targetPath}
                    // Explicitly pass empty state so clicking the main "Tasks" tab clears the filter
                    state={isTasks ? {} : undefined}
                    className={({ isActive }) => `w-full flex text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${(isActive && !showSubPage)
                      ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-white dark:text-[#7ED957] font-medium'
                      : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
                      }`}
                  >
                    {item}
                  </NavLink>
                  {showSubPage && (
                    <div className="ml-3 mt-1 border-l-2 border-[#6B905F]/30 pl-2">
                      <div className="w-full flex text-left px-3 py-1.5 rounded-md text-[13px] transition-colors bg-[#6B905F] dark:bg-[#6B905F]/15 text-white dark:text-[#7ED957] font-medium">
                        {location.state.assignee}'s Tasks
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    ))
  );

  return (
    <div
      className={`${isSidebarExpanded ? 'w-48' : 'w-14'} bg-[#F4F1EB] dark:bg-[#09090B] text-[#1D1E1B] dark:text-white flex flex-col transition-all duration-300 border-r border-[#2B3B26] h-screen shrink-0`}
      onMouseEnter={() => setIsHoveringsidebar(true)}
      onMouseLeave={() => setIsHoveringsidebar(false)}
    >
      {/* Sidebar Header */}
      <div className={`h-16 flex items-center border-b border-white/5 shrink-0 ${isSidebarExpanded ? 'px-4 justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#7ED957] dark:text-[#7ED957]" />
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
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-white dark:text-[#7ED957] font-medium'
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
        {renderProjectList(activeProjects)}

        {/* Divider */}
        <div className="h-px bg-[#6B905F] dark:bg-[#6B905F]/5 my-3"></div>



        {/* Other Nav Items */}
        <NavLink
          to="/todo"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-white dark:text-[#7ED957] font-medium'
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
              {myTasksCount}
            </Badge>
          )}
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-white dark:text-[#7ED957] font-medium'
            : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
            }`}
          title={!isSidebarExpanded ? 'Calendar' : ''}
        >
          <Calendar className="w-4 h-4" />
          {isSidebarExpanded && 'Calendar'}
        </NavLink>

        <NavLink
          to="/archive"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive || activeArchivedProject
            ? 'bg-[#6B905F] dark:bg-[#6B905F]/15 text-white dark:text-[#7ED957] font-medium'
            : 'text-[#1D1E1B] dark:text-white/70 hover:bg-[#6B905F]/[0.06] dark:hover:bg-white/5 hover:text-[#1D1E1B] dark:hover:text-white'
            }`}
          title={!isSidebarExpanded ? 'Archive' : ''}
        >
          <Archive className="w-4 h-4" />
          {isSidebarExpanded && 'Archive'}
        </NavLink>
        {activeArchivedProject && (
           <div className="mt-1">
             {renderProjectList([activeArchivedProject])}
           </div>
        )}

      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
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
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#27272A] hover:bg-gray-300 dark:hover:bg-[#2B3B26] text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors cursor-pointer"
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
      {/* Archive Confirmation Dialog */}
      {projectToArchive && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-[#6B905F]/20 flex items-center justify-center mb-4">
                <Archive className="w-6 h-6 text-[#6B905F]" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1E1B] dark:text-white mb-2">Archive Project?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to archive <span className="font-bold text-[#6B905F] dark:text-[#6B905F]">"{projectToArchive.name}"</span>? It will be locked from further edits but will remain accessible in the Archive tab.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToArchive(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#27272A] hover:bg-gray-300 dark:hover:bg-[#2B3B26] text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 px-4 py-2 bg-[#6B905F] hover:bg-[#5A7A4F] text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
