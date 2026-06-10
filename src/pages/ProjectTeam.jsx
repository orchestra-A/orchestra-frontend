import { UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

export default function ProjectTeam() {
  const { projectId } = useParams();
  const { projects } = useProject();
  
  const decodedId = decodeURIComponent(projectId || "").trim();
  const project = projects.find(p => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : "Project";
  const team = project && project.teamMembers ? project.teamMembers : [];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">{projectName} - Team</h1>
        </div>
        <Button className="bg-white dark:bg-[#1A1E2E] text-gray-700 dark:text-white/90 border border-gray-300 dark:border-[#2A3142] hover:bg-gray-50 dark:hover:bg-[#2A3142] shadow-sm">
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white dark:bg-[#1A1E2E] border border-gray-200 dark:border-[#2A3142] rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${member.color}`}>
              {member.initials}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white/90">{member.name}</h3>
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No team members assigned to tasks in this project yet.
          </div>
        )}
      </div>
    </div>
  );
}
