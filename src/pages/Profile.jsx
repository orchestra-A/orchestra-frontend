import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Contact, LayoutGrid, Lock, Fingerprint, ChevronRight, Code, Search, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PREDEFINED_SKILLS = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#', 
  'Ruby', 'Go', 'Rust', 'PHP', 'TypeScript', 'JavaScript', 'HTML/CSS', 
  'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 
  'Azure', 'GCP', 'GraphQL', 'REST API', 'Figma', 'UI/UX Design', 'TailwindCSS'
];

// User Profile Page
// Allows the authenticated user to view their info, update their password, 
// manage workspace integrations, and configure privacy settings.
export default function Profile() {
  // Local state for tab navigation (basic, integrations, privacy)
  const [activeTab, setActiveTab] = useState('details');
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [connected, setConnected] = useState({});
  const toggleWorkspace = (id) => setConnected(prev => ({ ...prev, [id]: !prev[id] }));

  // Skills state
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [savedSkills, setSavedSkills] = useState(['React', 'JavaScript']);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSaveSkills = () => {
    setSavedSkills(prev => Array.from(new Set([...prev, ...selectedSkills])));
    setSelectedSkills([]); // Clear selection after saving
  };

  const removeSavedSkill = (skillToRemove) => {
    setSavedSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const filteredSkills = PREDEFINED_SKILLS.filter(s => s.toLowerCase().includes(skillSearchQuery.toLowerCase()));

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const navigate = useNavigate();
  const { currentUser, updatePassword, deleteAccount } = useAuth();

  // Validate and submit password update request to the AuthContext
  const handleUpdatePassword = async () => {
    setPasswordMsg({ type: '', text: '' });
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  // Permanently delete user account and redirect to home
  const confirmDeleteAccount = async () => {
    setShowDeleteDialog(false);
    await deleteAccount();
    navigate('/');
  };

  const tabs = [
    { id: 'details', label: 'Profile Details', icon: Contact },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'platform', label: 'Workspaces', icon: LayoutGrid },
    { id: 'visibility', label: 'Visibility', icon: Lock },
    { id: 'accounts', label: 'Accounts', icon: Fingerprint },
  ];

  const workspacePlatforms = [
    { id: 'github', name: 'GitHub', desc: 'Track commits, PRs and branch activity automatically.', color: 'bg-slate-900 text-white' },
    { id: 'discord', name: 'Discord', desc: 'Sync team channels for standup updates and notifications.', color: 'bg-indigo-600 text-white' },
    { id: 'figma', name: 'Figma', desc: 'Capture layout changes and design file updates live.', color: 'bg-pink-600 text-white' },
  ];

  const renderContent = () => {
    switch (activeTab) {

      case 'details':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Profile Details</h1>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Job Title</label>
                <input type="text" defaultValue="Senior Developer" className="w-full max-w-md px-4 py-2.5 bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-[#1D1E1B] dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-all shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Bio</label>
                <textarea rows={4} defaultValue="Passionate developer building beautiful web applications." className="w-full max-w-lg px-4 py-2.5 bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-[#1D1E1B] dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-all resize-none shadow-sm"></textarea>
              </div>
              <button className="px-6 py-2.5 bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white font-medium rounded-lg transition-colors text-sm shadow-sm mt-4">
                Update Profile
              </button>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Technical Skills</h1>
            
            <div className="space-y-6">
              {/* My Skills Section */}
              <div className="bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">My Skills</h2>
                {savedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {savedSkills.map(skill => (
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">You haven't added any skills yet.</p>
                )}
              </div>

              {/* Add Skills Section */}
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

                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
                  {filteredSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    const isAlreadySaved = savedSkills.includes(skill);
                    if (isAlreadySaved) return null; // Don't show already saved skills in the selection pool

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
                  
                  {filteredSkills.filter(s => !savedSkills.includes(s)).length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center w-full">No new skills match your search.</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
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
              </div>
            </div>
          </div>
        );

      case 'platform':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Connect Workspaces</h1>

            <div className="flex flex-col gap-3">
              {workspacePlatforms.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-xl px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${p.color}`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWorkspace(p.id)}
                    className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${connected[p.id]
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                      : 'border border-gray-200 dark:border-[#27272A] text-gray-600 dark:text-white/70 hover:bg-[#F3F7F1] dark:hover:bg-[#2B3B26]'
                      }`}
                  >
                    {connected[p.id] ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-[#F3F7F1] dark:bg-[#18181B] border border-gray-100 dark:border-[#27272A] rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-white/60 mb-2">
                Active connections ({Object.values(connected).filter(Boolean).length}/3)
              </p>
              {Object.values(connected).some(Boolean)
                ? <p className="text-sm text-gray-600 dark:text-white/70">{Object.entries(connected).filter(([, v]) => v).map(([k]) => k).join(', ')} connected</p>
                : <p className="text-sm text-gray-400 dark:text-white/50">No workspaces connected yet.</p>
              }
            </div>
          </div>
        );

      case 'visibility':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Visibility</h1>

            <div className="space-y-6">
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#27272A] rounded-lg bg-[#F4F1EB] dark:bg-[#18181B] shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">Public Profile</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Allow anyone to view your profile</p>
                </div>
                <div
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${isPublic ? 'bg-[#6B905F] dark:bg-[#6B905F]' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-[#F4F1EB] rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0 border border-gray-100'}`}></div>
                </div>
              </div>
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#27272A] rounded-lg bg-[#F4F1EB] dark:bg-[#18181B] shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">Show Email</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Display your email address to others</p>
                </div>
                <div
                  onClick={() => setShowEmail(!showEmail)}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${showEmail ? 'bg-[#6B905F] dark:bg-[#6B905F]' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-[#F4F1EB] rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-200 ease-in-out ${showEmail ? 'translate-x-5' : 'translate-x-0 border border-gray-100'}`}></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Account Settings</h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B905F] dark:ring-[#6B905F] shadow-sm text-[#1D1E1B] dark:text-white/90"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B905F] dark:ring-[#6B905F] shadow-sm text-[#1D1E1B] dark:text-white/90"
                  />
                  {passwordMsg.text && (
                    <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <button
                    onClick={handleUpdatePassword}
                    className="px-6 py-2.5 bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200 dark:border-[#27272A]">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2">Delete Account</h2>
                <p className="text-sm text-gray-500 dark:text-white/50 mb-5">Once you delete your account, there is no going back. Please be certain.</p>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-6 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-medium rounded-lg transition-colors text-sm"
                >
                  Delete Account
                </button>
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
          className="text-[#6B905F] dark:text-[#6B905F] font-medium flex items-center gap-2 mb-8 cursor-pointer hover:text-[#6B905F] transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </div>

        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${isActive
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#F4F1EB] dark:bg-[#09090B] rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100 dark:border-[#27272A]">
            <h3 className="text-lg font-bold text-[#1D1E1B] dark:text-white/90 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-6">
              Are you sure you want to permanently delete your account? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-[#27272A] hover:bg-gray-200 dark:hover:bg-[#2B3B26]/80 text-gray-700 dark:text-white/90 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
