import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Inbox, Archive, Home, Calendar, Settings, Users, Clover, Plug } from 'lucide-react';
import { Badge } from '../ui/badge';

export function Sidebar({ sidebarCollapsed, setSidebarCollapsed, isHoveringSidebar, setIsHoveringsidebar }) {
  const [expandedProject, setExpandedProject] = useState('proj_marketing');
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const projects = [
    {
      id: 'proj_marketing',
      name: 'Project Marketing',
      items: ['Workflow', 'AI', 'Tasks', 'Team']
    },
    {
      id: 'proj_orchestra',
      name: 'Project Orchestra',
      items: ['Workflow', 'AI', 'Tasks', 'Team']
    }
  ];

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
      className={`${isSidebarExpanded ? 'w-48' : 'w-14'} bg-[#1E2433] text-white flex flex-col transition-all duration-300 border-r border-[#2A3142] h-screen shrink-0`}
      onMouseEnter={() => setIsHoveringsidebar(true)}
      onMouseLeave={() => setIsHoveringsidebar(false)}
    >
      {/* Sidebar Header */}
      <div className={`h-16 flex items-center border-b border-white/5 shrink-0 ${isSidebarExpanded ? 'px-4 justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#4A90E2]" />
          {isSidebarExpanded && <span className="font-medium text-[15px]">Orchestra</span>}
        </div>
        {isSidebarExpanded && !sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1.5 hover:bg-white/5 rounded-md transition-colors ml-auto shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {/* Home Button */}
        <NavLink
          to="/"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] mb-2 ${isActive
              ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
              : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
            }`}
          title={!isSidebarExpanded ? 'Home' : ''}
        >
          <Home className="w-4 h-4" />
          {isSidebarExpanded && 'Home'}
        </NavLink>

        {/* Divider */}
        <div className="h-px bg-white/5 my-3"></div>

        {/* Projects Label */}
        {isSidebarExpanded && (
          <div className="px-3 py-2 text-[11px] text-white/40 uppercase tracking-wider font-medium">
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/[0.06] transition-colors group"
              title={!isSidebarExpanded ? project.name : ''}
            >
              {isSidebarExpanded && <span className="text-[13px] text-white/90">{project.name}</span>}
              {!isSidebarExpanded && <span className="text-base font-semibold text-white/90">{project.name.charAt(0)}</span>}
              {isSidebarExpanded && (
                <ChevronRight
                  className={`w-4 h-4 text-white/40 transition-transform ${expandedProject === project.id ? 'rotate-90' : ''}`}
                />
              )}
            </button>

            {isSidebarExpanded && expandedProject === project.id && project.items.length > 0 && (
              <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
                {project.items.map((item) => {
                  const path = `${project.id}-${item.toLowerCase()}`;
                  return (
                    <NavLink
                      key={item}
                      to={`/${path}`}
                      className={({ isActive }) => `w-full flex text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${isActive
                          ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
                          : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                        }`}
                    >
                      {item}
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="h-px bg-white/5 my-3"></div>

        {/* Workspace Label */}
        {isSidebarExpanded && (
          <div className="px-3 py-2 text-[11px] text-white/40 uppercase tracking-wider font-medium">
            Workspace
          </div>
        )}

        <NavLink
          to="/workspaces"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
              ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
              : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
            }`}
          title={!isSidebarExpanded ? 'Workspaces' : ''}
        >
          <Plug className="w-4 h-4" />
          {isSidebarExpanded && 'Workspaces'}
        </NavLink>

        {/* Other Nav Items */}
        <NavLink
          to="/todo"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
              ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
              : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
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
              ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
              : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
            }`}
          title={!isSidebarExpanded ? 'Calendar' : ''}
        >
          <Calendar className="w-4 h-4" />
          {isSidebarExpanded && 'Calendar'}
        </NavLink>
        <NavLink
          to="/team"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
              ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
              : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
            }`}
          title={!isSidebarExpanded ? 'Team' : ''}
        >
          <Users className="w-4 h-4" />
          {isSidebarExpanded && 'Team'}
        </NavLink>
        <NavLink
          to="/archive"
          className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] ${isActive
              ? 'bg-[#4A90E2]/15 text-[#6BA7F0] font-medium'
              : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
            }`}
          title={!isSidebarExpanded ? 'Archive' : ''}
        >
          <Archive className="w-4 h-4" />
          {isSidebarExpanded && 'Archive'}
        </NavLink>

      </div>
      
      {/* End of Sidebar */}
    </div>
  );
}
