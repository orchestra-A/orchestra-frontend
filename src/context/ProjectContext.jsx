import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchTasks, fetchUsers, fetchProjects, updateTaskStatus, deleteProjectBackend, updateProjectBackend } from '../services/api';
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
        // Strictly use the name field from the projects table
        const pName = bp.name || bp.title || pId;

        const pMembers = Array.isArray(bp.members) 
          ? bp.members 
          : (typeof bp.members === 'string' ? [bp.members] : []);

        // User is the creator if created_by matches them (if created_by is NULL/missing, it's false)
        const isCreator = bp.created_by ? isUserMatch(bp.created_by) : false;

        const projectItems = isCreator
          ? ['Workflow', 'Tasks', 'Team', 'Activity', 'Modify']
          : ['Workflow', 'Tasks', 'Team', 'Activity'];

        const projectObj = {
          id: pId,
          name: pName, // Name strictly from projects table
          description: bp.description || 'No description provided.',
          taskCount: 0,
          memberCount: pMembers.length,
          teamMembers: pMembers.map(m => ({ id: m, name: m })),
          created_by: bp.created_by || null,
          isCreator,
          color: projectColors[idx % projectColors.length],
          items: projectItems,
          techStack: bp.tech_stack || bp.techStack || [],
          members: pMembers,
          tracked_repos: bp.tracked_repos || [],
          tracked_channels: bp.tracked_channels || [],
          is_archived: bp.is_archived || false,
          summary: bp.blueprint_summary || bp.summary || '',
        };

        projectMap[pId] = projectObj;
        if (bp.name) {
          projectMap[bp.name] = projectObj;
        }
      });

      // Incorporate tasks into task counts for each project retrieved
      // Map task project_id aliases to existing projects table entries
      allTasks.forEach((t) => {
        const pid = t.project_id;
        if (!pid) return;

        // 1. Direct match in projectMap
        if (projectMap[pid]) {
          projectMap[pid].taskCount += 1;
          return;
        }

        // 2. Match task project_id to an existing project from bProjects table by ID, name, or slug
        const matchingBp = bProjects.find((bp) => {
          const bId = (bp.project_id || bp.id || '').toLowerCase().trim();
          const bName = (bp.name || bp.title || '').toLowerCase().trim();
          const target = pid.toLowerCase().trim();

          if (target === bId || target === bName) return true;

          const cleanTarget = target.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
          const cleanBId = bId.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
          const cleanBName = bName.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');

          return cleanTarget && (cleanTarget === cleanBId || cleanTarget === cleanBName || cleanBName.includes(cleanTarget) || cleanTarget.includes(cleanBName));
        });

        if (matchingBp) {
          const realId = matchingBp.project_id || matchingBp.id;
          if (projectMap[realId]) {
            projectMap[realId].taskCount += 1;
            projectMap[pid] = projectMap[realId];
            return;
          }
        }
      });

      // Normalize every task's project_id to the canonical project ID
      // so all downstream code can use simple exact ID matching.
      // Names are for display only; IDs are the single source of truth.
      const normalizedTasks = allTasks.map((t) => {
        const pid = t.project_id;
        if (!pid) return t;

        // 1. Already a canonical project ID in the map
        if (projectMap[pid]) {
          return { ...t, project_id: projectMap[pid].id };
        }

        // 2. Fuzzy match to find canonical ID
        const matchingBp = bProjects.find((bp) => {
          const bId = (bp.project_id || bp.id || '').toLowerCase().trim();
          const bName = (bp.name || bp.title || '').toLowerCase().trim();
          const target = pid.toLowerCase().trim();

          if (target === bId || target === bName) return true;

          const cleanTarget = target.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
          const cleanBId = bId.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
          const cleanBName = bName.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');

          return cleanTarget && (cleanTarget === cleanBId || cleanTarget === cleanBName || cleanBName.includes(cleanTarget) || cleanTarget.includes(cleanBName));
        });

        if (matchingBp) {
          const realId = matchingBp.project_id || matchingBp.id;
          return { ...t, project_id: realId };
        }

        return t;
      });

      setTasks(normalizedTasks);

      // Deduplicate unique project objects
      const allComputedProjects = Array.from(new Set(Object.values(projectMap)));

      // Filter projects to ONLY those created by or containing the user as a member
      const userAssignedProjects = currentUser
        ? allComputedProjects.filter((p) => {
            // 1. User created the project
            if (p.created_by && isUserMatch(p.created_by)) return true;
            // 2. User is listed in members list
            if (Array.isArray(p.members) && p.members.some(m => isUserMatch(m))) return true;
            
            return false;
          })
        : [];

      setProjects(prevProjects => {
        const backendProjectIds = new Set(userAssignedProjects.map(p => p.id));
        const missingOptimisticProjects = prevProjects.filter(p => !backendProjectIds.has(p.id));
        return [...userAssignedProjects, ...missingOptimisticProjects];
      });
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

  const deleteProject = async (id) => {
    try {
      console.log(`[ProjectContext] Initiating deletion for project: ${id}`);
      await deleteProjectBackend(id);
      console.log(`[ProjectContext] Backend deletion successful for project: ${id}. Updating local state...`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await loadData();
    } catch (err) {
      console.error(`[ProjectContext] Failed to delete project ${id}:`, err);
    }
  };

  const archiveProject = async (id, setArchived = true) => {
    try {
      await updateProjectBackend(id, { is_archived: setArchived });
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, is_archived: setArchived } : p));
      await loadData();
    } catch (err) {
      console.error('Failed to archive project:', err);
    }
  };

  const changeTaskStatus = async (taskId, newStatus) => {
    const oldTask = tasks.find(t => t.id === taskId);
    const oldStatus = oldTask ? oldTask.status : null;

    // Optimistically update the task in the local state instantly
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? { ...t, status: newStatus, isUpdating: true } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
      // Remove the updating flag on success
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? { ...t, isUpdating: false } : t))
      );
    } catch (error) {
      console.error('Failed to change task status:', error);
      // Revert to original status on failure
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? { ...t, status: oldStatus, isUpdating: false } : t))
      );
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{ projects, tasks, allUsers, addProject, updateProject, deleteProject, archiveProject, changeTaskStatus, loading, refreshData: loadData }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
