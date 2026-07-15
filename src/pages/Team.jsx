import { MessageCircle, Globe, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useMemo, useState } from 'react';

// Inline GitHub SVG (lucide-react Github export not available in this version)
const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// Platform icon badge
function PlatformBadge({ platform }) {
  const map = {
    github: { icon: GithubIcon, cls: 'bg-slate-800 text-white' },
    discord: { icon: MessageCircle, cls: 'bg-indigo-600 text-white' },
    google: { icon: Globe, cls: 'bg-red-500 text-white' },
  };
  const p = map[platform?.toLowerCase()];
  if (!p) return null;
  const Icon = p.icon;
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${p.cls}`} title={platform}>
      <Icon className="w-2.5 h-2.5" />
    </span>
  );
}

// Global Team page — shows all team members across projects the logged-in user is part of,
// enriched with backend data (skills, platforms_connected, email, github_username).
export default function Team() {
  const { projects, allUsers } = useProject();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');

  // Collect all unique assigned_to usernames across the user's projects
  const projectMemberUsernames = useMemo(() => {
    const set = new Set();
    projects.forEach((project) => {
      project.teamMembers?.forEach((m) => set.add(m.username));
    });
    return set;
  }, [projects]);

  // Enrich each team member with full backend data from allUsers
  const enrichedMembers = useMemo(() => {
    const memberColors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-cyan-100 text-cyan-700',
      'bg-yellow-100 text-yellow-700',
    ];

    return Array.from(projectMemberUsernames)
      .map((username) => {
        const backendUser = allUsers.find((u) => u.username === username);
        const colorHash = username.length % memberColors.length;
        return {
          username,
          user_id: backendUser?.user_id || username,
          email: backendUser?.email || null,
          skills: backendUser?.skills || [],
          platforms_connected: backendUser?.platforms_connected || [],
          github_username: backendUser?.github_username || null,
          discord_username: backendUser?.discord_username || null,
          initials: username.substring(0, 2).toUpperCase(),
          color: memberColors[colorHash],
          // Highlight if this is the current user
          isCurrentUser: username === currentUser?.username,
        };
      })
      .sort((a, b) => (b.isCurrentUser ? 1 : 0) - (a.isCurrentUser ? 1 : 0));
  }, [projectMemberUsernames, allUsers, currentUser]);

  const filtered = enrichedMembers.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">Team Members</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            {enrichedMembers.length} member{enrichedMembers.length !== 1 ? 's' : ''} across your projects
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 bg-[#F4F1EB] dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-[#27272A] overflow-y-auto shadow-sm min-h-0">
        <table className="w-full text-left text-sm text-gray-600 dark:text-white/70">
          <thead className="bg-[#F3F7F1] dark:bg-[#18181B] border-b border-gray-200 dark:border-[#27272A] text-gray-500 dark:text-white/50 uppercase text-xs font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Skills</th>
              <th className="px-6 py-4">Platforms</th>
              <th className="px-6 py-4">GitHub</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2B3B26]">
            {filtered.map((member) => (
              <tr
                key={member.user_id}
                className={`hover:bg-[#F3F7F1] dark:hover:bg-[#1C2618] transition-colors ${
                  member.isCurrentUser ? 'bg-[#6B905F]/5 dark:bg-[#6B905F]/10' : ''
                }`}
              >
                {/* Avatar + name + email */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${member.color}`}>
                      {member.initials}
                    </div>
                    <div>
                      <div className="font-medium text-[#1D1E1B] dark:text-white/90 flex items-center gap-2">
                        {member.username}
                        {member.isCurrentUser && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#6B905F] text-white">You</span>
                        )}
                      </div>
                      {member.email && (
                        <div className="text-xs text-gray-500 dark:text-white/40">{member.email}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Skills */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.length > 0 ? (
                      member.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#6B905F]/15 text-[#2B4A24] dark:text-[#7ED957] border border-[#6B905F]/25"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-white/30 text-xs">—</span>
                    )}
                  </div>
                </td>

                {/* Connected platforms */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {member.platforms_connected.length > 0 ? (
                      member.platforms_connected.map((p) => (
                        <PlatformBadge key={p} platform={p} />
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-white/30 text-xs">—</span>
                    )}
                  </div>
                </td>

                {/* GitHub */}
                <td className="px-6 py-4">
                  {member.github_username ? (
                    <a
                      href={`https://github.com/${member.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-white/60 hover:text-[#6B905F] dark:hover:text-[#7ED957] transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      {member.github_username}
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-white/30 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-white/40">
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
