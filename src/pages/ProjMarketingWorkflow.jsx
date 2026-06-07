import { WorkflowCanvas } from '../components/WorkflowCanvas';

export default function ProjMarketingWorkflow() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">Project Marketing - Workflow</h1>
      </div>
      <div className="flex-1 min-h-[700px]">
        <WorkflowCanvas projectId="proj_marketing" />
      </div>
    </div>
  );
}
