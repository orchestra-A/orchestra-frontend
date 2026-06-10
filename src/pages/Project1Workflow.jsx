import { WorkflowCanvas } from '../components/WorkflowCanvas';

export default function Project1Workflow() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">Project 1 - Workflow</h1>
      </div>
      <div className="flex-1 min-h-[700px]">
        <WorkflowCanvas />
      </div>
    </div>
  );
}
