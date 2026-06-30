import { FolderOpen, Plus, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useProject } from '../context/ProjectContext';

export default function Projects() {
  const { projects } = useProject();

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">Workspaces & Projects</h1>
        </div>
        <Button className="bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {projects.map(project => (
          <div key={project.id} className="bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] p-6 shadow-sm transition-all hover:shadow-md hover:border-[#6B905F] dark:border-[#6B905F]/30 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}15` }}>
                <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
              </div>
              <Badge variant="secondary" className={project.taskCount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                {project.taskCount > 0 ? 'Active' : 'Planning'}
              </Badge>
            </div>
            <h3 className="text-[#1D1E1B] dark:text-white/90 font-semibold mb-2">{project.name}</h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-6 flex-1 line-clamp-2">{project.description}</p>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-white/50 mb-4 pb-4 border-b border-gray-100 dark:border-[#27272A]">
                <span>{project.taskCount} tasks</span>
                <span>{project.memberCount} members</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
