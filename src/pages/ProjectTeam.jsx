import { UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ProjectTeam({ projectName = "Project" }) {
  const mockTeam = [
    { id: 1, name: 'Sarah Connor', role: 'Project Lead', initials: 'SC', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'John Doe', role: 'Developer', initials: 'JD', color: 'bg-purple-100 text-purple-700' },
    { id: 3, name: 'Alice Smith', role: 'Designer', initials: 'AS', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">{projectName} - Team</h1>
          <p className="text-gray-500">View members assigned to this project.</p>
        </div>
        <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm">
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTeam.map(member => (
          <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${member.color}`}>
              {member.initials}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
