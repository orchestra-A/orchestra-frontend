import { CheckCircle2, Circle, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function ProjectTasks() {
  const { projectId } = useParams();
  const { projects, tasks } = useProject();
  const { currentUser } = useAuth();
  
  const decodedId = decodeURIComponent(projectId || "").trim();
  const project = projects.find(p => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : "Project";

  // Filter tasks for this project and specifically assigned to the logged in user
  const projectTasks = tasks.filter(t => {
    const pId = (t.project_id || "").trim();
    return (pId === decodedId || pId === projectId) && t.assigned_to === (currentUser?.name || "Guest");
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">{projectName} - Tasks (Member 1)</h1>
        </div>
        <Button className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1A1E2E] rounded-lg border border-gray-200 dark:border-[#2A3142] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 dark:bg-[#141824] border-b border-gray-200 dark:border-[#2A3142] text-gray-500 dark:text-white/50 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Task Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2A3142]">
            {projectTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-[#2A3142] transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white/90'}`}>
                    {task.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 capitalize">{task.priority}</td>
                <td className="px-6 py-4">{task.assigned_to}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {projectTasks.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No tasks assigned to you for this project.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
