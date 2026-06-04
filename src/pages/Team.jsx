import { Mail, Phone, Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Team() {
  const realTeam = [
    { id: 1, name: 'Isha Mahadev', role: 'Interface Developer', track: 'Frontend', initials: 'IM', color: 'bg-indigo-100 text-indigo-700' },
    { id: 2, name: 'Member 5', role: 'Canvas Specialist', track: 'Frontend', initials: 'M5', color: 'bg-indigo-100 text-indigo-700' },
    { id: 3, name: 'Arnav', role: 'Infrastructure Engineer', track: 'Backend', initials: 'AN', color: 'bg-emerald-100 text-emerald-700' },
    { id: 4, name: 'Member 4', role: 'Data Pipeline Engineer', track: 'Backend', initials: 'M4', color: 'bg-emerald-100 text-emerald-700' },
    { id: 5, name: 'Member 1', role: 'Agent Architect', track: 'AI & Graph', initials: 'M1', color: 'bg-violet-100 text-violet-700' },
    { id: 6, name: 'Member 2', role: 'Knowledge Graph Engineer', track: 'AI & Graph', initials: 'M2', color: 'bg-violet-100 text-violet-700' },
  ];

  const tc = {
    'Frontend':   'bg-indigo-50 text-indigo-700 border border-indigo-100',
    'Backend':    'bg-emerald-50 text-emerald-700 border border-emerald-100',
    'AI & Graph': 'bg-violet-50 text-violet-700 border border-violet-100',
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">Team Members</h1>
          <p className="text-gray-500">View and manage everyone in your workspace.</p>
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

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Track</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {realTeam.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${member.color}`}>
                    {member.initials}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-gray-500 text-xs">{member.role}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${tc[member.track]}`}>
                    {member.track}
                  </span>
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
