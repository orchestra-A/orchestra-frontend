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
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[500px]">
        <WorkflowCanvas projectId={projectId} title={`${projectName} - Workflow`} />
      </div>
    </div>
  );
}
