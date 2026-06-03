import { Mail, Phone, Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Team() {
  const mockTeam = [
    { id: 1, name: 'Sarah Connor', role: 'Product Manager', email: 'sarah@clover.app', initials: 'SC', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'John Doe', role: 'Lead Developer', email: 'john@clover.app', initials: 'JD', color: 'bg-purple-100 text-purple-700' },
    { id: 3, name: 'Alice Smith', role: 'UX Designer', email: 'alice@clover.app', initials: 'AS', color: 'bg-green-100 text-green-700' },
    { id: 4, name: 'Bob Johnson', role: 'Backend Engineer', email: 'bob@clover.app', initials: 'BJ', color: 'bg-yellow-100 text-yellow-700' },
    { id: 5, name: 'Emma Davis', role: 'Marketing Lead', email: 'emma@clover.app', initials: 'ED', color: 'bg-pink-100 text-pink-700' },
  ];

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
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockTeam.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${member.color}`}>
                    {member.initials}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-gray-500 text-xs">{member.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
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
