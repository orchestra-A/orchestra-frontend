import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export function useProject() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([
    {
      id: 'proj_marketing',
      name: 'Project Marketing',
      description: 'Marketing campaign redesign and implementation',
      taskCount: 8,
      memberCount: 4,
      color: '#4A90E2',
      items: ['Workflow', 'AI', 'Tasks', 'Team']
    },
    {
      id: 'proj_orchestra',
      name: 'Project Orchestra',
      description: 'Core platform development and orchestration',
      taskCount: 12,
      memberCount: 6,
      color: '#9B59B6',
      items: ['Workflow', 'AI', 'Tasks', 'Team']
    }
  ]);

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
