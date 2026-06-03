import { FolderOpen, Plus, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Projects() {
  const mockProjects = [
    { id: 1, name: 'Project 1', desc: 'Marketing campaign redesign and implementation', status: 'Active', color: '#4A90E2', tasks: 8, members: 4 },
    { id: 2, name: 'Project 2', desc: 'Mobile app development and testing phase', status: 'Active', color: '#9B59B6', tasks: 12, members: 6 },
    { id: 3, name: 'Q3 Product Roadmap', desc: 'Planning and execution for Q3 deliverables', status: 'Planning', color: '#F59E42', tasks: 0, members: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">All Projects</h1>
          <p className="text-gray-500">Manage and view all your team's ongoing initiatives.</p>
        </div>
        <Button className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white">
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
        {mockProjects.map(project => (
          <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md hover:border-[#4A90E2]/30 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}15` }}>
                <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
              </div>
              <Badge variant="secondary" className={project.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                {project.status}
              </Badge>
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">{project.name}</h3>
            <p className="text-sm text-gray-500 mb-4 flex-1">{project.desc}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
              <span>{project.tasks} tasks</span>
              <span>{project.members} members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
