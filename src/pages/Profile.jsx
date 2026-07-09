import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Contact, LayoutGrid, Lock, Fingerprint, Code, Search, Check, X,
  MessageCircle, Globe, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Inline GitHub SVG (lucide-react Github export not available in this version)
const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const PREDEFINED_SKILLS = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#',
  'Ruby', 'Go', 'Rust', 'PHP', 'TypeScript', 'JavaScript', 'HTML/CSS',
  'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'GCP', 'GraphQL', 'REST API', 'Figma', 'UI/UX Design', 'TailwindCSS',
  // Backend-seeded skills that may not be in the predefined list
  'Data Pipeline Engineer', 'Interactive Canvas Specialist', 'Lead - PM - AI Developer',
  'Knowledge Graph Engineer', 'Infrastructure Engineer', 'Interface Developer',
  'Blockchain Engineer', 'Smart Contracts', 'DeFi Product Manager', 'Strategy',
  'Frontend Web3 Developer', 'Security Auditor', 'Cryptography', 'DevOps Engineer',
];

const PLATFORM_CONFIG = {
  github: {
    name: 'GitHub',
    desc: 'Track commits, PRs and branch activity automatically.',
    icon: GithubIcon,
    color: 'bg-slate-900 text-white',
    authUrl: 'https://orchestra-backend-30fy.onrender.com/auth/github',
  },
  discord: {
    name: 'Discord',
    desc: 'Sync team channels for standup updates and notifications.',
    icon: MessageCircle,
    color: 'bg-indigo-600 text-white',
    authUrl: 'https://orchestra-backend-30fy.onrender.com/auth/discord',
  },
  google: {
    name: 'Google',
    desc: 'Link your Google account for single sign-on and calendar sync.',
    icon: Globe,
    color: 'bg-red-500 text-white',
    authUrl: 'https://orchestra-backend-30fy.onrender.com/auth/google',
  },
};

// User Profile Page
// Displays and allows editing of the authenticated user's backend profile data.
export default function Profile() {
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  // ── Skills ────────────────────────────────────────────────────────────────
  const [savedSkills, setSavedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillSaveStatus, setSkillSaveStatus] = useState('');

  // Initialise skills from the backend user profile
  useEffect(() => {
    if (currentUser?.skills?.length > 0) {
      setSavedSkills(currentUser.skills);
    }
  }, [currentUser?.skills]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSaveSkills = async () => {
    const merged = Array.from(new Set([...savedSkills, ...selectedSkills]));
    setSavedSkills(merged);
    setSelectedSkills([]);
    setSkillSaveStatus('saving');
    try {
      await updateProfile({ skills: merged });
      setSkillSaveStatus('saved');
    } catch {
      setSkillSaveStatus('error');
    }
    setTimeout(() => setSkillSaveStatus(''), 2500);
  };

  const removeSavedSkill = async (skillToRemove) => {
    const updated = savedSkills.filter((s) => s !== skillToRemove);
    setSavedSkills(updated);
    try {
      await updateProfile({ skills: updated });
    } catch {
      // fail silently, local state is already updated
    }
  };

  const allSkills = Array.from(new Set([...PREDEFINED_SKILLS, ...savedSkills]));
  const filteredSkills = allSkills.filter((s) =>
    s.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  // ── Platforms ─────────────────────────────────────────────────────────────
  // Use the actual platforms_connected array from the backend user
  const connectedPlatforms = new Set(
    (currentUser?.platforms_connected || []).map((p) => p.toLowerCase())
  );

  // ── Visibility ────────────────────────────────────────────────────────────
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'details', label: 'Profile Details', icon: Contact },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'platform', label: 'Workspaces', icon: LayoutGrid },
    { id: 'visibility', label: 'Visibility', icon: Lock },
    { id: 'accounts', label: 'Accounts', icon: Fingerprint },
  ];

  const renderContent = () => {
    switch (activeTab) {
      // ── Profile Details ──────────────────────────────────────────────────
      case 'details':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Profile Details</h1>
            <div className="space-y-6">
              {/* Username (read-only from backend) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Username</label>
                <div className="w-full max-w-md px-4 py-2.5 bg-gray-100 dark:bg-[#27272A] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-gray-500 dark:text-white/50 select-all">
                  {currentUser?.username || '—'}
                </div>
                <p className="text-xs text-gray-400 dark:text-white/30">Set by your OAuth provider. Cannot be changed here.</p>
              </div>

              {/* Email (read-only from backend) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Email</label>
                <div className="w-full max-w-md px-4 py-2.5 bg-gray-100 dark:bg-[#27272A] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-gray-500 dark:text-white/50 select-all">
                  {currentUser?.email || '—'}
                </div>
                <p className="text-xs text-gray-400 dark:text-white/30">Synced from your connected account.</p>
              </div>

              {/* GitHub username */}
              {currentUser?.github_username && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-white/80">GitHub</label>
                  <a
                    href={`https://github.com/${currentUser.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#6B905F] dark:text-[#7ED957] hover:underline"
                  >
                    <GithubIcon className="w-4 h-4" />
                    {currentUser.github_username}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Discord username */}
              {currentUser?.discord_username && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Discord</label>
                  <p className="text-sm text-gray-700 dark:text-white/70 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    {currentUser.discord_username}
                  </p>
                </div>
              )}

              {/* Member since */}
              {currentUser?.created_at && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Member since</label>
                  <p className="text-sm text-gray-500 dark:text-white/50">
                    {new Date(currentUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      // ── Skills ────────────────────────────────────────────────────────────
      case 'skills':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Technical Skills</h1>
            <div className="space-y-6">
              {/* My Skills */}
              <div className="bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">My Skills</h2>
                {savedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {savedSkills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#6B905F]/30 dark:bg-[#6B905F]/25 text-[#1C361D] dark:text-[#7ED957] border border-[#6B905F]/40 dark:border-[#6B905F]/50 shadow-sm"
                      >
                        {skill}
                        <button
                          onClick={() => removeSavedSkill(skill)}
                          className="hover:bg-[#1C361D]/10 dark:hover:bg-white/20 p-0.5 rounded-full transition-colors text-[#1C361D] dark:text-[#7ED957]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No skills added yet.</p>
                )}
              </div>

              {/* Add More Skills */}
              <div className="bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Add More Skills</h2>
                <div className="flex items-center gap-2 mb-6 bg-white dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#6B905F]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[#1D1E1B] dark:text-white/90"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto pr-2 pb-2">
                  {filteredSkills
                    .filter((s) => !savedSkills.includes(s))
                    .map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            isSelected
                              ? 'bg-[#6B905F] text-white border-[#6B905F]'
                              : 'bg-white dark:bg-[#09090B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#27272A] hover:border-[#6B905F] hover:text-[#6B905F]'
                          }`}
                        >
                          {skill}
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveSkills}
                  disabled={selectedSkills.length === 0}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-colors text-sm shadow-sm ${
                    selectedSkills.length > 0
                      ? 'bg-[#6B905F] hover:bg-[#5A7A4F] text-white'
                      : 'bg-gray-300 dark:bg-[#27272A] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Skills
                </button>
                {skillSaveStatus === 'saving' && <span className="text-sm text-gray-400">Saving...</span>}
                {skillSaveStatus === 'saved' && <span className="text-sm text-green-500">✓ Saved to profile</span>}
                {skillSaveStatus === 'error' && <span className="text-sm text-red-500">Failed to save</span>}
              </div>
            </div>
          </div>
        );

      // ── Workspaces / Platform Connections ─────────────────────────────────
      case 'platform':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-2">Connect Workspaces</h1>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-8">
              Active connections ({connectedPlatforms.size}/3) — connecting a platform lets Orchestra track activity automatically.
            </p>

            <div className="flex flex-col gap-3">
              {Object.entries(PLATFORM_CONFIG).map(([key, p]) => {
                const isConnected = connectedPlatforms.has(key);
                const Icon = p.icon;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between bg-[#F4F1EB] dark:bg-[#18181B] border rounded-xl px-5 py-4 shadow-sm transition-all ${
                      isConnected
                        ? 'border-[#6B905F]/40 dark:border-[#6B905F]/30'
                        : 'border-gray-200 dark:border-[#27272A]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{p.name}</p>
                        <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                    {isConnected ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <a
                        href={`${p.authUrl}?user_id=${currentUser?.user_id || ''}`}
                        className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-[#27272A] text-gray-600 dark:text-white/70 hover:bg-[#F3F7F1] dark:hover:bg-[#2B3B26] transition-colors"
                      >
                        Connect
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ── Visibility ────────────────────────────────────────────────────────
      case 'visibility':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Visibility</h1>
            <div className="space-y-6">
              {[
                { label: 'Public Profile', desc: 'Allow anyone to view your profile', state: isPublic, toggle: () => setIsPublic(!isPublic) },
                { label: 'Show Email', desc: 'Display your email address to others', state: showEmail, toggle: () => setShowEmail(!showEmail) },
              ].map(({ label, desc, state, toggle }) => (
                <div key={label} className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#27272A] rounded-lg bg-[#F4F1EB] dark:bg-[#18181B] shadow-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">{label}</h3>
                    <p className="text-xs text-gray-500 dark:text-white/50">{desc}</p>
                  </div>
                  <div
                    onClick={toggle}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${state ? 'bg-[#6B905F]' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-[#F4F1EB] rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-200 ease-in-out ${state ? 'translate-x-5' : 'translate-x-0 border border-gray-100'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── Accounts ──────────────────────────────────────────────────────────
      case 'accounts':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Account Settings</h1>
            <div className="space-y-6">
              <div className="bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2">Password</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  Your account is authenticated via OAuth ({currentUser?.platforms_connected?.join(', ') || 'social login'}).
                  Passwords are managed by your connected provider.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-[#27272A]">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2">Account Info</h2>
                <div className="space-y-2 text-sm text-gray-600 dark:text-white/60">
                  <p><span className="font-medium">User ID:</span> {currentUser?.user_id || '—'}</p>
                  <p><span className="font-medium">Username:</span> {currentUser?.username || '—'}</p>
                  <p><span className="font-medium">Email:</span> {currentUser?.email || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex bg-[#F8F9FA] dark:bg-[#09090B] h-full rounded-lg overflow-hidden border border-gray-200 dark:border-[#27272A]">
      {/* Left Sidebar */}
      <div className="w-[280px] bg-[#F4F1EB] dark:bg-[#18181B] border-r border-gray-200 dark:border-[#27272A] p-6 flex flex-col flex-shrink-0">
        <div
          onClick={() => navigate('/')}
          className="text-[#6B905F] dark:text-[#6B905F] font-medium flex items-center gap-2 mb-6 cursor-pointer hover:text-[#5A7A4F] transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </div>

        {/* User avatar + name in sidebar */}
        <div className="flex items-center gap-3 mb-8 p-3 bg-[#6B905F]/10 dark:bg-[#6B905F]/10 rounded-xl border border-[#6B905F]/20">
          <div className="w-10 h-10 rounded-full bg-[#6B905F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(currentUser?.username || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">{currentUser?.username || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-white/50 truncate">{currentUser?.email || ''}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F3F4F6] dark:bg-[#27272A] text-[#1D1E1B] dark:text-white/90'
                    : 'text-[#1D1E1B] dark:text-white/50 hover:bg-[#F3F7F1] dark:hover:bg-[#2B3B26]/50 hover:text-[#1D1E1B] dark:hover:text-white/70'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-gray-700 dark:text-white/80' : 'text-gray-400 dark:text-white/50'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-[#F4F1EB] dark:bg-[#09090B]">
        {renderContent()}
      </div>
    </div>
  );
}
