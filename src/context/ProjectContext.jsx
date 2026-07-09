import { createContext, useContext, useState, useEffect } from 'react';
import { fetchTasks, fetchUsers } from '../services/api';

const ProjectContext = createContext();

// Custom hook to consume the project data context
export function useProject() {
  return useContext(ProjectContext);
}

// Provider component that manages global state for Projects, Tasks, and Team Data.
// It fetches data from the backend and scopes everything to the logged-in user:
//   - Only projects where the user's username appears in at least one task's assigned_to
//   - All users fetched once and exposed as `allUsers` for team enrichment
export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);       // All tasks for the current user's projects
  const [allUsers, setAllUsers] = useState([]);  // All backend users (for team enrichment)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Read the current user from localStorage (avoids circular dependency with AuthContext)
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        // Use username as the identifier — this matches the assigned_to field in tasks
        const currentUsername = storedUser?.username || null;

        // Fetch all tasks and all users in parallel
        const [allTasks, users] = await Promise.all([
          fetchTasks(),
          fetchUsers(),
        ]);

        setAllUsers(users);

        // If we have a logged-in user, filter to only their tasks/projects
        const relevantTasks = currentUsername
          ? allTasks.filter((t) => t.assigned_to === currentUsername)
          : allTasks;

        // Build a project map from the relevant tasks
        const projectMap = {};
        const projectColors = [
          '#6B905F', '#9B59B6', '#F59E42', '#34D399',
          '#EC4899', '#8B5CF6', '#38BDF8', '#F87171',
        ];
        let colorIndex = 0;

        // Also collect ALL tasks for each project the user belongs to
        // (so team members who work on the same project are visible)
        const userProjectIds = new Set(relevantTasks.map((t) => t.project_id).filter(Boolean));

        const projectTasks = allTasks.filter((t) => userProjectIds.has(t.project_id));

        projectTasks.forEach((t) => {
          const pid = t.project_id;
          if (!pid) return;

          if (!projectMap[pid]) {
            const formattedName = pid
              .replace(/^proj_/, '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());

            projectMap[pid] = {
              id: pid,
              name: formattedName,
              description: `Tasks and activity for the ${formattedName} project.`,
              taskCount: 0,
              membersMap: {},
              color: projectColors[colorIndex % projectColors.length],
              items: ['Workflow', 'Tasks', 'Team', 'Activity'],
            };
            colorIndex++;
          }

          projectMap[pid].taskCount += 1;

          // Build a members map per project from assigned_to field
          if (t.assigned_to) {
            if (!projectMap[pid].membersMap[t.assigned_to]) {
              const memberColors = [
                'bg-blue-100 text-blue-700',
                'bg-purple-100 text-purple-700',
                'bg-green-100 text-green-700',
                'bg-orange-100 text-orange-700',
                'bg-pink-100 text-pink-700',
                'bg-cyan-100 text-cyan-700',
              ];
              const colorHash = t.assigned_to.length % memberColors.length;
              const backendUser = users.find((u) => u.username === t.assigned_to);

              projectMap[pid].membersMap[t.assigned_to] = {
                id: t.assigned_to,
                username: t.assigned_to,
                name: backendUser?.username || t.assigned_to,
                email: backendUser?.email || null,
                skills: backendUser?.skills || [],
                platforms_connected: backendUser?.platforms_connected || [],
                github_username: backendUser?.github_username || null,
                initials: t.assigned_to.substring(0, 2).toUpperCase(),
                color: memberColors[colorHash],
              };
            }
          }
        });

        const computedProjects = Object.values(projectMap).map((p) => ({
          ...p,
          memberCount: Object.keys(p.membersMap).length,
          teamMembers: Object.values(p.membersMap),
          membersMap: undefined,
        }));

        // Store all tasks for the user's projects (needed for team pages, workflow, etc.)
        setTasks(projectTasks);
        setProjects(computedProjects);
      } catch (error) {
        console.error('Failed to load project data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addProject = (projectData) => {
    const colors = ['#F59E42', '#34D399', '#EC4899', '#8B5CF6', '#F87171', '#38BDF8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject = {
      id: `proj_${Date.now()}`,
      name: projectData.title || 'Untitled Project',
      description: projectData.description || 'No description provided.',
      taskCount: 0,
      memberCount: projectData.members?.filter((m) => m.value.trim()).length || 0,
      teamMembers: [],
      color: randomColor,
      items: ['Workflow', 'Tasks', 'Team', 'Activity'],
      techStack: projectData.techStack || [],
      members: projectData.members || [],
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

  return (
    <ProjectContext.Provider
      value={{ projects, tasks, allUsers, addProject, updateProject, deleteProject, loading }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
