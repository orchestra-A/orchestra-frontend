import React, { useState } from 'react';
import { UserPlus, MessageCircle, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { addMemberBackend } from '../services/api';

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
  const navigate = useNavigate();
  const { isLoading } = useOutletContext() || {};
  const { projects, allUsers, loading, refreshData } = useProject();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addError, setAddError] = useState('');

  const decodedId = decodeURIComponent(projectId || '').trim();
  const project = projects.find((p) => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : 'Project';
  
  const { currentUser } = useAuth();
  const currentUserId = currentUser ? (currentUser.user_id || currentUser.id || currentUser.username || currentUser.email) : null;
  const isCreator = project && currentUserId && (project.created_by === currentUserId);

  const rawTeam = project?.teamMembers || project?.members || [];

  const avatarColors = [
    'bg-[#6B905F]/20 text-[#2B4A24] dark:bg-[#6B905F]/30 dark:text-[#7ED957]',
    'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  ];

  const handleAddMemberSubmit = async () => {
    const un = newMemberUsername.trim();
    if (!un) return;

    // Validate against allUsers
    const matchedUser = allUsers.find(u => 
      u.username?.toLowerCase() === un.toLowerCase() || 
      u.user_id?.toLowerCase() === un.toLowerCase() ||
      u.email?.toLowerCase() === un.toLowerCase()
    );

    if (!matchedUser) {
      setAddError("User not found. Please ensure they have created an account.");
      return;
    }

    const skills = matchedUser.skills || [];

    setIsAddingMember(true);
    setAddError('');

    try {
      const response = await addMemberBackend({
        name: matchedUser.username || matchedUser.name || un,
        skills: skills,
        project_id: decodedId
      });

      console.log(`[Add Member] Successfully added ${matchedUser.username || un}!`);
      console.log(`[Add Member] AI Response:`, response);
      if (response.moved?.length > 0) {
        console.log(`[Add Member] AI rebalanced ${response.assigned_to_new_member} tasks (${response.points_taken} points) to them out of ${response.considered} considered.`);
        console.table(response.moved);
      }

      await refreshData();
      setIsAddModalOpen(false);
      setNewMemberUsername('');
      navigate(`/project/${projectId}/workflow`);
    } catch (err) {
      console.error(err);
      setAddError(err.message || 'Failed to add member.');
    } finally {
      setIsAddingMember(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="w-full h-full flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-[#27272A] rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-[#27272A] rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-[#27272A] rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i, idx) => {
            const avatarColors = [
              'bg-[#6B905F]/20 dark:bg-[#6B905F]/30',
              'bg-purple-500/20',
              'bg-blue-500/20',
              'bg-amber-500/20',
            ];
            const colorClass = avatarColors[idx % avatarColors.length];
            return (
              <div key={i} className="bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 ${colorClass}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-[#27272A] rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-gray-300 dark:bg-[#27272A] rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="h-5 w-16 bg-[#6B905F]/15 border border-[#6B905F]/25 rounded-full"></div>
                  <div className="h-5 w-20 bg-[#6B905F]/15 border border-[#6B905F]/25 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">{projectName} — Team</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{rawTeam.length} member{rawTeam.length !== 1 ? 's' : ''}</p>
        </div>
        {isCreator && (
          <Button 
            className="bg-[#F4F1EB] dark:bg-[#09090B] text-gray-700 dark:text-white/90 border border-gray-300 dark:border-[#27272A] hover:bg-[#F3F7F1] dark:hover:bg-[#2B3B26] shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#1D1E1B] dark:text-white/90 mb-4">Add Team Member</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={newMemberUsername}
                onChange={(e) => { setNewMemberUsername(e.target.value); setAddError(''); }}
                className="w-full bg-gray-50 dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-lg px-4 py-2.5 text-[#1D1E1B] dark:text-white/90 focus:outline-none focus:border-[#6B905F]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMemberUsername.trim()) {
                    handleAddMemberSubmit();
                  }
                }}
              />
              {addError && <p className="text-red-500 text-xs mt-2">{addError}</p>}
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => { setIsAddModalOpen(false); setNewMemberUsername(''); setAddError(''); }}
                disabled={isAddingMember}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#6B905F] hover:bg-[#5A7A4F] text-white" 
                onClick={handleAddMemberSubmit}
                disabled={isAddingMember || !newMemberUsername.trim()}
              >
                {isAddingMember ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Adding...
                  </span>
                ) : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rawTeam.map((member, idx) => {
          const memberStr = typeof member === 'string' ? member.trim() : (member.name || member.id || member.username || member.value || '');
          const matchedUser = allUsers?.find(u => 
            (u.username && u.username.toLowerCase() === memberStr.toLowerCase()) ||
            (u.user_id && u.user_id.toLowerCase() === memberStr.toLowerCase()) ||
            (u.name && u.name.toLowerCase() === memberStr.toLowerCase()) ||
            (u.email && u.email.toLowerCase() === memberStr.toLowerCase())
          ) || {};

          const name = matchedUser.name || matchedUser.username || memberStr || 'Team Member';
          const email = matchedUser.email || (typeof member === 'object' ? member.email : '');
          const skills = matchedUser.skills || (typeof member === 'object' ? member.skills : []) || [];
          const platforms = matchedUser.platforms_connected || (typeof member === 'object' ? member.platforms_connected : []) || [];
          const github = matchedUser.github_username || (typeof member === 'object' ? member.github_username : '');
          
          const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M';
          const colorClass = avatarColors[idx % avatarColors.length];

          return (
            <div
              key={member.id || memberStr || idx}
              onClick={() => {
                if (!project?.is_archived) {
                  navigate(`/project/${projectId}/tasks`, { 
                    state: { 
                      assignee: name,
                      assigneeAliases: [memberStr, matchedUser.username, matchedUser.name, matchedUser.email, matchedUser.user_id].filter(Boolean)
                    } 
                  });
                }
              }}
              className={`bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl p-5 flex flex-col gap-3 transition-all ${
                !project?.is_archived 
                  ? 'hover:shadow-md hover:border-[#6B905F] dark:hover:border-[#6B905F]/40 cursor-pointer shadow-sm' 
                  : 'opacity-80 cursor-default'
              }`}
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${colorClass}`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#1D1E1B] dark:text-white/90 truncate">{name}</h3>
                  {email && (
                    <p className="text-xs text-gray-500 dark:text-white/50 truncate">{email}</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
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
              {platforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((p) => (
                    <PlatformBadge key={p} platform={p} />
                  ))}
                </div>
              )}

              {/* GitHub username */}
              {github && (
                <p className="text-xs text-gray-500 dark:text-white/40 flex items-center gap-1">
                  <GithubIcon className="w-3 h-3" />
                  {github}
                </p>
              )}
            </div>
          );
        })}

        {rawTeam.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500 dark:text-white/40">
            No team members found for this project.
          </div>
        )}
      </div>
    </div>
  );
}
