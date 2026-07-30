import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchTasks, fetchUsers, fetchProjects, updateTaskStatus } from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

// Custom hook to consume the project data context
export function useProject() {
  return useContext(ProjectContext);
}

// Provider component that manages global state for Projects, Tasks, and Team Data.
export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);       // All tasks for the current user's projects
  const [allUsers, setAllUsers] = useState([]);  // All backend users (for team enrichment)
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Determine user_id to pass for server-side project filtering
      const uid = currentUser?.user_id || currentUser?.id || null;

      // Fetch all tasks, users, and projects in parallel
      // fetchProjects(uid) sends ?user_id= so the backend only returns
      // projects the user created or is a member of
      const [allTasks, users, bProjects] = await Promise.all([
        fetchTasks().catch(() => []),
        fetchUsers().catch(() => []),
        fetchProjects(uid).catch(() => []),
      ]);

      setAllUsers(users);
      setTasks(allTasks);

      // Build comprehensive set of user aliases (ID, username, email, etc.)
      const userAliases = new Set();
      const userAliasCleanSet = new Set();

      if (currentUser) {
        const addAlias = (val) => {
          if (!val) return;
          const raw = val.toString().trim().toLowerCase();
          if (!raw) return;
          userAliases.add(raw);
          const clean = raw.replace(/[^a-z0-9]/g, '');
          if (clean) userAliasCleanSet.add(clean);

          if (raw.includes('@')) {
            const prefix = raw.split('@')[0];
            userAliases.add(prefix);
            const cleanPrefix = prefix.replace(/[^a-z0-9]/g, '');
            if (cleanPrefix) userAliasCleanSet.add(cleanPrefix);
          }
        };

        addAlias(currentUser.user_id);
        addAlias(currentUser.username);
        addAlias(currentUser.email);
        addAlias(currentUser.id);
        addAlias(currentUser.name);
        addAlias(currentUser.github_username);
        addAlias(currentUser.discord_id);

        users.forEach(u => {
          const rawUid = (u.user_id || '').toLowerCase();
          const rawUname = (u.username || '').toLowerCase();
          const rawEmail = (u.email || '').toLowerCase();
          const rawId = (u.id || '').toString().toLowerCase();

          const matches = 
            (rawUid && (userAliases.has(rawUid) || userAliasCleanSet.has(rawUid.replace(/[^a-z0-9]/g, '')))) ||
            (rawUname && (userAliases.has(rawUname) || userAliasCleanSet.has(rawUname.replace(/[^a-z0-9]/g, '')))) ||
            (rawEmail && (userAliases.has(rawEmail) || userAliasCleanSet.has(rawEmail.replace(/[^a-z0-9]/g, '')))) ||
            (rawId && (userAliases.has(rawId) || userAliasCleanSet.has(rawId.replace(/[^a-z0-9]/g, ''))));

          if (matches) {
            addAlias(u.user_id);
            addAlias(u.username);
            addAlias(u.email);
            addAlias(u.id);
            addAlias(u.name);
          }
        });
      }

      const isUserMatch = (val) => {
        if (!val) return false;
        if (Array.isArray(val)) return val.some(item => isUserMatch(item));
        if (typeof val === 'object') return isUserMatch(val.id || val.username || val.name || val.email || val.user_id);
        const str = val.toString().trim().toLowerCase();
        if (userAliases.has(str)) return true;
        const cleanStr = str.replace(/[^a-z0-9]/g, '');
        if (cleanStr && userAliasCleanSet.has(cleanStr)) return true;
        if (str.includes('@')) {
          const prefix = str.split('@')[0];
          if (userAliases.has(prefix)) return true;
          const cleanPrefix = prefix.replace(/[^a-z0-9]/g, '');
          if (cleanPrefix && userAliasCleanSet.has(cleanPrefix)) return true;
        }
        return false;
      };

      const projectColors = [
        '#6B905F', '#9B59B6', '#F59E42', '#34D399',
        '#EC4899', '#8B5CF6', '#38BDF8', '#F87171',
      ];

      // Build map directly from backend GET /projects (projects table)
      const projectMap = {};

      bProjects.forEach((bp, idx) => {
        const pId = bp.project_id || bp.id || `proj_${idx}`;
        const pName = bp.name || bp.title || pId;

        const pMembers = Array.isArray(bp.members) 
          ? bp.members 
          : (typeof bp.members === 'string' ? [bp.members] : []);

        const creatorVal = bp.created_by || bp.user_id || 'System';
        const isCreator = isUserMatch(creatorVal);

        const projectItems = isCreator
          ? ['Workflow', 'Tasks', 'Team', 'Activity', 'Modify']
          : ['Workflow', 'Tasks', 'Team', 'Activity'];

        projectMap[pId] = {
          id: pId,
          name: pName,
          description: bp.description || 'No description provided.',
          taskCount: 0,
          memberCount: pMembers.length,
          teamMembers: pMembers.map(m => ({ id: m, name: m })),
          created_by: creatorVal,
          isCreator,
          color: projectColors[idx % projectColors.length],
          items: projectItems,
          techStack: bp.tech_stack || bp.techStack || [],
          members: pMembers,
        };
      });

      // Incorporate tasks into task counts for each project retrieved
      // ONLY synthesize virtual project if task is assigned to current user
      allTasks.forEach((t) => {
        const pid = t.project_id;
        if (pid) {
          if (projectMap[pid]) {
            projectMap[pid].taskCount += 1;
          } else if (isUserMatch(t.assigned_to)) {
            // Synthesize virtual project ONLY for tasks assigned to current user
            projectMap[pid] = {
              id: pid,
              name: pid.startsWith('proj-') ? pid.replace('proj-', '').replace(/-/g, ' ') : pid,
              description: 'Project generated from assigned workflow tasks.',
              taskCount: 1,
              memberCount: 1,
              teamMembers: currentUser ? [{ id: currentUser.username || currentUser.user_id, name: currentUser.username || currentUser.name || 'User' }] : [],
              created_by: t.assigned_to || 'System',
              isCreator: false,
              color: projectColors[Object.keys(projectMap).length % projectColors.length],
              items: ['Workflow', 'Tasks', 'Team', 'Activity'],
              techStack: [],
              members: [t.assigned_to],
            };
          }
        }
      });

      const allComputedProjects = Object.values(projectMap);

      // Filter projects to ONLY those created by, assigned to, or containing tasks for current user
      const userAssignedProjects = currentUser
        ? allComputedProjects.filter((p) => {
            // 1. User created the project
            if (isUserMatch(p.created_by)) return true;
            // 2. User is listed in members list
            if (Array.isArray(p.members) && p.members.some(m => isUserMatch(m))) return true;
            // 3. User is assigned to at least one task in this project
            const hasAssignedTask = allTasks.some((t) => {
              if (!isUserMatch(t.assigned_to)) return false;
              const tid = (t.project_id || '').toLowerCase().trim();
              const pid = (p.id || '').toLowerCase().trim();
              const pname = (p.name || '').toLowerCase().trim();

              if (!tid) return false;
              if (tid === pid || tid === pname) return true;

              const cleanTid = tid.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
              const cleanPid = pid.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
              const cleanPname = pname.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');

              if (cleanTid && (cleanTid === cleanPid || cleanTid === cleanPname || cleanPid.includes(cleanTid) || cleanPname.includes(cleanTid))) {
                return true;
              }
              return false;
            });
            if (hasAssignedTask) return true;
            return false;
          })
        : allComputedProjects;

      setProjects(userAssignedProjects);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addProject = (projectData, createdBy = null) => {
    const colors = ['#F59E42', '#34D399', '#EC4899', '#8B5CF6', '#F87171', '#38BDF8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const creatorId = createdBy || currentUser?.user_id || currentUser?.id || currentUser?.username || currentUser?.email || 'System';

    const newProject = {
      id: projectData.id || `proj_${Date.now()}`,
      name: projectData.title || 'Untitled Project',
      description: projectData.description || 'No description provided.',
      taskCount: 0,
      memberCount: projectData.members?.filter((m) => typeof m === 'string' ? m.trim() : (m.value || '').trim()).length || 0,
      teamMembers: [],
      color: randomColor,
      items: ['Workflow', 'Tasks', 'Team', 'Activity'],
      techStack: projectData.techStack || [],
      members: projectData.members || [],
      created_by: creatorId,
    };

    setProjects((prev) => [...prev, newProject]);
    return newProject.id;
  };

  const updateProject = (id, updatedData) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name: updatedData.title || p.name,
            description: updatedData.description || p.description,
            memberCount:
              updatedData.members?.filter((m) => m.value.trim()).length || p.memberCount,
            techStack: updatedData.techStack || p.techStack || [],
            members: updatedData.members || p.members || [],
          };
        }
        return p;
      })
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const changeTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error('Failed to change task status:', error);
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{ projects, tasks, allUsers, addProject, updateProject, deleteProject, changeTaskStatus, loading, refreshData: loadData }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
