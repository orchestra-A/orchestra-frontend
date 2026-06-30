import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

// Custom hook to consume the project data context
export function useProject() {
  return useContext(ProjectContext);
}

// Provider component that manages global state for Projects, Tasks, and Workflow Data.
// It fetches initial data from an API and provides methods to create or delete projects.
export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsFromTasks = async () => {
      try {
        const response = await fetch('https://orchestra-backend-30fy.onrender.com/tasks');
        const data = await response.json();
        
        if (data && data.tasks) {
          const projectMap = {};
          
          data.tasks.forEach(t => {
            const pid = t.project_id || "Project 1";
            
            if (!projectMap[pid]) {
              // Create a formatted name, e.g., proj_marketing -> Marketing
              const formattedName = pid === "Project 1" ? "Project 1" : pid.replace("proj_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              
              projectMap[pid] = {
                id: pid,
                name: formattedName,
                description: `Automatically generated project from tasks.`,
                taskCount: 0,
                membersMap: {}, 
                color: ['#6B905F', '#9B59B6', '#F59E42', '#34D399', '#EC4899', '#8B5CF6'][Object.keys(projectMap).length % 6],
                items: ['Workflow', 'Tasks', 'Team', 'Activity']
              };
            }
            
            projectMap[pid].taskCount += 1;
            
            if (t.assigned_to) {
              if (!projectMap[pid].membersMap[t.assigned_to]) {
                const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
                const colorHash = t.assigned_to.length % colors.length;

                projectMap[pid].membersMap[t.assigned_to] = {
                  id: t.assigned_to,
                  name: t.assigned_to,
                  initials: t.assigned_to.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                  color: colors[colorHash]
                };
              }
            }
          });
          
          const computedProjects = Object.values(projectMap).map(p => ({
            ...p,
            memberCount: Object.keys(p.membersMap).length,
            teamMembers: Object.values(p.membersMap),
            membersMap: undefined 
          }));
          
          // Store raw tasks globally so components can compute their own logic
          setTasks(data.tasks);
          setProjects(computedProjects);
          
          // Empty these out since ProjectWorkflow will compute them per-project now
          setRawNodes([]);
          setRawEdges([]);
        }
      } catch (error) {
        console.error("Failed to fetch tasks to build projects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectsFromTasks();
  }, []);

  const addProject = (projectData) => {
    const colors = ['#F59E42', '#34D399', '#EC4899', '#8B5CF6', '#F87171', '#38BDF8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject = {
      id: `proj_${Date.now()}`,
      name: projectData.title || 'Untitled Project',
      description: projectData.description || 'No description provided.',
      taskCount: 0,
      memberCount: projectData.members?.filter(m => m.value.trim()).length || 0,
      color: randomColor,
      items: ['Workflow', 'Tasks', 'Team', 'Activity'],
      techStack: projectData.techStack || [],
      members: projectData.members || []
    };
    
    setProjects(prev => [...prev, newProject]);
    return newProject.id;
  };

  const updateProject = (id, updatedData) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: updatedData.title || p.name,
          description: updatedData.description || p.description,
          memberCount: updatedData.members?.filter(m => m.value.trim()).length || p.memberCount,
          // We could also save techStack and full members list in context if needed
          techStack: updatedData.techStack || p.techStack || [],
          members: updatedData.members || p.members || []
        };
      }
      return p;
    }));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, tasks, rawNodes, rawEdges, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
