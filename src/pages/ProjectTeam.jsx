import { UserPlus, MessageCircle, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

// Inline GitHub SVG (lucide-react Github export not available in this version)
const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// Platform icon helper
function PlatformBadge({ platform }) {
  const map = {
    github: { icon: GithubIcon, label: 'GitHub', cls: 'bg-slate-800 text-white' },
    discord: { icon: MessageCircle, label: 'Discord', cls: 'bg-indigo-600 text-white' },
    google: { icon: Globe, label: 'Google', cls: 'bg-red-500 text-white' },
  };
  const p = map[platform?.toLowerCase()];
  if (!p) return null;
  const Icon = p.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${p.cls}`}>
      <Icon className="w-2.5 h-2.5" />
      {p.label}
    </span>
  );
}

// Project Team page — shows all members on a specific project with enriched backend data.
export default function ProjectTeam() {
  const { projectId } = useParams();
  const { projects, tasks } = useProject();

  const decodedId = decodeURIComponent(projectId || '').trim();
  const project = projects.find((p) => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : 'Project';

  // teamMembers already contain enriched data from ProjectContext (skills, platforms_connected, etc.)
  const team = project?.teamMembers || [];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">{projectName} — Team</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{team.length} member{team.length !== 1 ? 's' : ''}</p>
        </div>
        <Button className="bg-[#F4F1EB] dark:bg-[#09090B] text-gray-700 dark:text-white/90 border border-gray-300 dark:border-[#27272A] hover:bg-[#F3F7F1] dark:hover:bg-[#2B3B26] shadow-sm">
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl p-5 shadow-sm flex flex-col gap-3 hover:shadow-md hover:border-[#6B905F]/40 transition-all"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${member.color}`}>
                {member.initials}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#1D1E1B] dark:text-white/90 truncate">{member.username}</h3>
                {member.email && (
                  <p className="text-xs text-gray-500 dark:text-white/50 truncate">{member.email}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            {member.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#6B905F]/15 text-[#2B4A24] dark:text-[#7ED957] border border-[#6B905F]/25"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Connected platforms */}
            {member.platforms_connected?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {member.platforms_connected.map((p) => (
                  <PlatformBadge key={p} platform={p} />
                ))}
              </div>
            )}

            {/* GitHub username */}
            {member.github_username && (
              <p className="text-xs text-gray-500 dark:text-white/40 flex items-center gap-1">
                <GithubIcon className="w-3 h-3" />
                {member.github_username}
              </p>
            )}
          </div>
        ))}

        {team.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500 dark:text-white/40">
            No team members found for this project.
          </div>
        )}
      </div>
    </div>
  );
}
