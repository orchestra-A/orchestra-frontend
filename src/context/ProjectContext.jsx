import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function useProject() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsFromTasks = async () => {
      try {
        const response = await fetch('https://orchestra-ai-36zm.onrender.com/graph');
        const data = await response.json();
        
        if (data && data.nodes) {
          setRawNodes(data.nodes);
          setRawEdges(data.edges || []);

          const newTasks = data.nodes.map(node => ({
            id: node.id,
            title: node.data.label,
            status: node.data.status,
            assigned_to: node.data.assigned_to,
            project_id: node.data.project_name || "Project 1"
          }));

          setTasks(newTasks); // Store mapped tasks for global use
          const projectMap = {};
          
          newTasks.forEach(task => {
            const pid = task.project_id;
            if (!projectMap[pid]) {
              projectMap[pid] = {
                id: pid,
                name: pid, // Using project_id as name directly since it defaults to "Project 1"
                description: `Automatically generated project from tasks.`,
                taskCount: 0,
                membersMap: {}, 
                color: ['#4A90E2', '#9B59B6', '#F59E42', '#34D399', '#EC4899', '#8B5CF6'][Object.keys(projectMap).length % 6],
                items: ['Workflow', 'AI', 'Tasks', 'Team']
              };
            }
            
            projectMap[pid].taskCount += 1;
            if (task.assigned_to) {
              if (!projectMap[pid].membersMap[task.assigned_to]) {
                const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
                const colorHash = task.assigned_to.length % colors.length;

                projectMap[pid].membersMap[task.assigned_to] = {
                  id: task.assigned_to,
                  name: task.assigned_to,
                  initials: task.assigned_to.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
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
    <ProjectContext.Provider value={{ projects, tasks, rawNodes, rawEdges, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
