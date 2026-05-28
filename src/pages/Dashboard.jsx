import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { WorkflowCanvas } from '../components/WorkflowCanvas';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back, Isha" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-text-muted text-sm font-medium">Active Tasks</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">12</p>
        </Card>
        <Card>
          <h3 className="text-text-muted text-sm font-medium">In Progress</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">4</p>
        </Card>
        <Card>
          <h3 className="text-text-muted text-sm font-medium">Completed</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">8</p>
        </Card>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-surface-2">
          <h3 className="font-semibold text-text-primary">Developer Workflow</h3>
        </div>
        <div className="p-6">
          <WorkflowCanvas />
        </div>
      </div>
    </div>
  );
}
