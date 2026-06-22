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

  // Filter all tasks for this project
  const allProjectTasks = tasks.filter(t => {
    const pId = (t.project_id || "Project 1").trim();
    return (pId === decodedId || pId === projectId);
  });

  const userName = currentUser?.name || "Guest";
  const hasUserTasks = allProjectTasks.some(t => t.assigned_to === userName);
  
  const targetUser = hasUserTasks ? userName : "Member 1";
  
  const projectTasks = allProjectTasks.filter(t => t.assigned_to === targetUser);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">{projectName} - Tasks ({targetUser})</h1>
        </div>
        <Button className="bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="bg-[#F4F1EB] dark:bg-[#121910] rounded-lg border border-gray-200 dark:border-[#2B3B26] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-[#F3F7F1] dark:bg-[#1C2618] border-b border-gray-200 dark:border-[#2B3B26] text-gray-500 dark:text-white/50 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Task Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2B3B26]">
            {projectTasks.map((task) => (
              <tr key={task.id} className="hover:bg-[#F3F7F1] dark:hover:bg-[#2B3B26] transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-[#1D1E1B] dark:text-white/90'}`}>
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
