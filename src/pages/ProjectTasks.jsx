import { CheckCircle2, Circle, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function ProjectTasks({ projectName = "Project" }) {
  const tasks = [
    { id: 1, title: 'Design Database Schema', status: 'completed', priority: 'High', assignee: 'Sarah' },
    { id: 2, title: 'Implement Authentication', status: 'in-progress', priority: 'High', assignee: 'John' },
    { id: 3, title: 'Create Dashboard Layout', status: 'pending', priority: 'Medium', assignee: 'Alice' },
    { id: 4, title: 'Write API Documentation', status: 'pending', priority: 'Low', assignee: 'Unassigned' },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">{projectName} - Tasks</h1>
          <p className="text-gray-500">Manage tasks and track progress for this project.</p>
        </div>
        <Button className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Task Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {task.status.replace('-', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4">{task.priority}</td>
                <td className="px-6 py-4">{task.assignee}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
