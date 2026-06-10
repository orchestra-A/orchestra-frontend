import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Contact, LayoutGrid, Lock, Fingerprint, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [connected, setConnected] = useState({});
  const toggleWorkspace = (id) => setConnected(prev => ({ ...prev, [id]: !prev[id] }));
  
  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  
  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const navigate = useNavigate();
  const { currentUser, updatePassword, deleteAccount } = useAuth();

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

  const confirmDeleteAccount = async () => {
    setShowDeleteDialog(false);
    await deleteAccount();
    navigate('/');
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'details', label: 'Profile Details', icon: Contact },
    { id: 'platform', label: 'Workspaces', icon: LayoutGrid },
    { id: 'visibility', label: 'Visibility', icon: Lock },
    { id: 'accounts', label: 'Accounts', icon: Fingerprint },
  ];

  const workspacePlatforms = [
    { id: 'github',  name: 'GitHub',  desc: 'Track commits, PRs and branch activity automatically.', color: 'bg-slate-900 text-white' },
    { id: 'discord', name: 'Discord', desc: 'Sync team channels for standup updates and notifications.', color: 'bg-indigo-600 text-white' },
    { id: 'figma',   name: 'Figma',   desc: 'Capture layout changes and design file updates live.', color: 'bg-pink-600 text-white' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Basic Info</h1>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input type="text" defaultValue={currentUser?.name || 'John Doe'} className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm text-gray-900 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input type="email" defaultValue={currentUser?.email || 'johndoe@example.com'} className="w-full max-w-md px-4 py-2.5 bg-gray-50 dark:bg-[#141824]/50 border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm text-gray-500 dark:text-white/50" disabled />
                <span className="text-xs text-gray-500 dark:text-white/50">Email address cannot be changed here.</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <input type="text" defaultValue="San Francisco, CA" className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm text-gray-900 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all shadow-sm" />
              </div>
              <button className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors text-sm shadow-sm mt-4">
                Save Changes
              </button>
            </div>
          </div>
        );
      
      case 'details':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Profile Details</h1>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Job Title</label>
                <input type="text" defaultValue="Senior Developer" className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm text-gray-900 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Bio</label>
                <textarea rows={4} defaultValue="Passionate developer building beautiful web applications." className="w-full max-w-lg px-4 py-2.5 bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm text-gray-900 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all resize-none shadow-sm"></textarea>
              </div>
              <button className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors text-sm shadow-sm mt-4">
                Update Profile
              </button>
            </div>
          </div>
        );

      case 'platform':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Connect Workspaces</h1>

            <div className="flex flex-col gap-3">
              {workspacePlatforms.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-xl px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${p.color}`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWorkspace(p.id)}
                    className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                      connected[p.id]
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'border border-gray-200 dark:border-[#2A3142] text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-[#2A3142]'
                    }`}
                  >
                    {connected[p.id] ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gray-50 dark:bg-[#141824] border border-gray-100 dark:border-[#2A3142] rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Active connections ({Object.values(connected).filter(Boolean).length}/3)
              </p>
              {Object.values(connected).some(Boolean)
                ? <p className="text-sm text-gray-600 dark:text-white/70">{Object.entries(connected).filter(([,v])=>v).map(([k])=>k).join(', ')} connected</p>
                : <p className="text-sm text-gray-400">No workspaces connected yet.</p>
              }
            </div>
          </div>
        );

      case 'visibility':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Visibility</h1>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#2A3142] rounded-lg bg-white dark:bg-[#141824] shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">Public Profile</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Allow anyone to view your profile</p>
                </div>
                <div 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${isPublic ? 'bg-[#4A90E2]' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0 border border-gray-100'}`}></div>
                </div>
              </div>
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#2A3142] rounded-lg bg-white dark:bg-[#141824] shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">Show Email</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Display your email address to others</p>
                </div>
                <div 
                  onClick={() => setShowEmail(!showEmail)}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${showEmail ? 'bg-[#4A90E2]' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-200 ease-in-out ${showEmail ? 'translate-x-5' : 'translate-x-0 border border-gray-100'}`}></div>
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
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] shadow-sm text-gray-900 dark:text-white/90" 
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#141824] border border-gray-200 dark:border-[#2A3142] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] shadow-sm text-gray-900 dark:text-white/90" 
                  />
                  {passwordMsg.text && (
                    <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <button 
                    onClick={handleUpdatePassword}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-[#2A3142] hover:bg-gray-200 dark:hover:bg-[#2A3142]/80 text-gray-800 dark:text-white/90 font-medium rounded-lg transition-colors text-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="pt-8 border-t border-gray-200 dark:border-[#2A3142]">
                <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
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
    <div className="flex bg-[#F8F9FA] dark:bg-[#1A1E2E] h-full rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A3142]">
      {/* Left Sidebar */}
      <div className="w-[280px] bg-white dark:bg-[#141824] border-r border-gray-200 dark:border-[#2A3142] p-6 flex flex-col flex-shrink-0">
        <div 
          onClick={() => navigate('/')}
          className="text-[#4A90E2] font-medium flex items-center gap-2 mb-8 cursor-pointer hover:text-[#3A78C4] transition-colors text-sm"
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
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#F3F4F6] dark:bg-[#2A3142] text-gray-900 dark:text-white/90' 
                    : 'text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-[#2A3142]/50 hover:text-gray-700 dark:hover:text-white/70'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-gray-700' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-[#1A1E2E]">
        {renderContent()}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1E2E] rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100 dark:border-[#2A3142]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white/90 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-6">
              Are you sure you want to permanently delete your account? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-[#2A3142] hover:bg-gray-200 dark:hover:bg-[#2A3142]/80 text-gray-700 dark:text-white/90 font-medium rounded-lg transition-colors text-sm"
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
