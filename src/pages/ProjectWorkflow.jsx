import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { WorkflowCanvas } from '../components/WorkflowCanvas';

export default function ProjectWorkflow() {
  const { projectId } = useParams();
  const { projects } = useProject();
  
  const decodedId = decodeURIComponent(projectId || "").trim();
  const project = projects.find(p => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : 'Project';

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">{projectName} - Workflow</h1>
      </div>
      <div className="flex-1 min-h-[700px]">
        <WorkflowCanvas projectId={projectId} />
      </div>
    </div>
  );
}
