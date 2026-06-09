import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function useProject() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsFromTasks = async () => {
      try {
        const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://orchestra-backend-2v5a.onrender.com/tasks'));
        const data = await response.json();
        
        if (data && data.tasks) {
          const projectMap = {};
          
          data.tasks.forEach(task => {
            const pid = task.project_id;
            if (!projectMap[pid]) {
              // Generate a readable name from project_id (e.g., 'proj_orchestra' -> 'Project Orchestra')
              const nameParts = pid.split('_');
              const readableName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
              
              projectMap[pid] = {
                id: pid,
                name: readableName,
                description: `Automatically generated project from tasks.`,
                taskCount: 0,
                uniqueMembers: new Set(),
                color: ['#4A90E2', '#9B59B6', '#F59E42', '#34D399', '#EC4899', '#8B5CF6'][Object.keys(projectMap).length % 6],
                items: ['Workflow', 'AI', 'Tasks', 'Team']
              };
            }
            
            projectMap[pid].taskCount += 1;
            if (task.assigned_to) {
              projectMap[pid].uniqueMembers.add(task.assigned_to);
            }
          });
          
          const computedProjects = Object.values(projectMap).map(p => ({
            ...p,
            memberCount: p.uniqueMembers.size,
            uniqueMembers: undefined // remove the set
          }));
          
          setProjects(computedProjects);
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
      items: ['Workflow', 'AI', 'Tasks', 'Team'],
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
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
