import { Mail, Phone, Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useProject } from '../context/ProjectContext';
import { useMemo } from 'react';

export default function Team() {
  const { projects } = useProject();

  const allMembers = useMemo(() => {
    const memberMap = new Map();
    projects.forEach(project => {
      project.teamMembers?.forEach(member => {
        if (!memberMap.has(member.id)) {
          memberMap.set(member.id, member);
        }
      });
    });
    return Array.from(memberMap.values());
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">Team Members</h1>
        </div>
        <Button className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white">
          <Plus className="w-4 h-4 mr-2" /> Invite Member
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search members..." className="pl-10" />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1A1E2E] rounded-lg border border-gray-200 dark:border-[#2A3142] overflow-y-auto shadow-sm min-h-0">
        <table className="w-full text-left text-sm text-gray-600 dark:text-white/70">
          <thead className="bg-gray-50 dark:bg-[#141824] border-b border-gray-200 dark:border-[#2A3142] text-gray-500 dark:text-white/50 uppercase text-xs font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2A3142]">
            {allMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-[#141824] transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${member.color}`}>
                    {member.initials}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white/90">{member.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-gray-400 hover:text-[#4A90E2] transition-colors p-1">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-[#4A90E2] transition-colors p-1">
                    <Phone className="w-4 h-4" />
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
