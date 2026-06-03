import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Contact, LayoutGrid, Lock, Fingerprint, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('platform');
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  
  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

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

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
      await deleteAccount();
      navigate('/');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'details', label: 'Profile Details', icon: Contact },
    { id: 'platform', label: 'Platform', icon: LayoutGrid },
    { id: 'visibility', label: 'Visibility', icon: Lock },
    { id: 'accounts', label: 'Accounts', icon: Fingerprint },
  ];

  const platforms = [
    { id: 'figma', name: 'Figma', placeholder: 'https://www.figma.com/@johndoe', iconUrl: 'https://cdn.simpleicons.org/figma/F24E1E' },
    { id: 'discord', name: 'Discord', placeholder: 'https://discord.com/users/johndoe', iconUrl: 'https://cdn.simpleicons.org/discord/5865F2' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 mb-2">Basic Info</h1>
            <p className="text-gray-500 text-[15px] mb-10">Manage your personal information and contact details.</p>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input type="text" defaultValue={currentUser?.name || 'John Doe'} className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input type="email" defaultValue={currentUser?.email || 'johndoe@example.com'} className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" disabled />
                <span className="text-xs text-gray-500">Email address cannot be changed here.</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <input type="text" defaultValue="San Francisco, CA" className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all shadow-sm" />
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
            <h1 className="text-[26px] font-bold text-gray-800 mb-2">Profile Details</h1>
            <p className="text-gray-500 text-[15px] mb-10">Add your professional details and skills.</p>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Job Title</label>
                <input type="text" defaultValue="Senior Developer" className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Bio</label>
                <textarea rows={4} defaultValue="Passionate developer building beautiful web applications." className="w-full max-w-lg px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition-all resize-none shadow-sm"></textarea>
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
            <h1 className="text-[26px] font-bold text-gray-800 mb-2">Platforms</h1>
            <p className="text-gray-500 text-[15px] mb-10">You can update and verify your platform details here.</p>

            <div className="mb-10">
              <h2 className="text-[19px] font-bold text-gray-800 mb-6">Development</h2>
              <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
                <div className="w-[190px] flex items-center gap-3 flex-shrink-0 ml-2">
                  <div className="w-[22px] h-[22px] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800 flex items-center gap-2 text-[15px]">
                    Github <ChevronRight size={16} className="text-gray-600" />
                  </span>
                </div>
                
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="https://github.com/johndoe"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                
                <button className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm flex-shrink-0 shadow-sm mr-2">
                  Submit
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-[19px] font-bold text-gray-800 mb-6">Problem Solving</h2>
              <div className="flex flex-col gap-5">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center gap-4">
                    <div className="w-[190px] flex items-center gap-3 flex-shrink-0 ml-2">
                      <div className="w-[22px] h-[22px] flex items-center justify-center">
                        {platform.iconUrl ? (
                          <img src={platform.iconUrl} alt={platform.name} className="max-w-full max-h-full" />
                        ) : (
                          platform.iconSvg
                        )}
                      </div>
                      <span className="font-semibold text-gray-800 flex items-center gap-2 text-[15px]">
                        {platform.name} <ChevronRight size={16} className="text-gray-600" />
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder={platform.placeholder}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all shadow-sm"
                      />
                    </div>
                    
                    <button className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm flex-shrink-0 shadow-sm mr-2">
                      Submit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'visibility':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 mb-2">Visibility</h1>
            <p className="text-gray-500 text-[15px] mb-10">Control who can see your profile and activity.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">Public Profile</h3>
                  <p className="text-xs text-gray-500">Allow anyone to view your profile</p>
                </div>
                <div 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${isPublic ? 'bg-[#4A90E2]' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0 border border-gray-100'}`}></div>
                </div>
              </div>
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">Show Email</h3>
                  <p className="text-xs text-gray-500">Display your email address to others</p>
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
            <h1 className="text-[26px] font-bold text-gray-800 mb-2">Accounts</h1>
            <p className="text-gray-500 text-[15px] mb-10">Manage your account security and data.</p>
            
            <div className="space-y-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] shadow-sm" 
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] shadow-sm" 
                  />
                  {passwordMsg.text && (
                    <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <button 
                    onClick={handleUpdatePassword}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors text-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-gray-500 mb-5">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium rounded-lg transition-colors text-sm"
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
    <div className="flex bg-[#F8F9FA] h-full rounded-lg overflow-hidden border border-gray-200">
      {/* Left Sidebar */}
      <div className="w-[280px] bg-white border-r border-gray-200 p-6 flex flex-col flex-shrink-0">
        <div 
          onClick={() => navigate('/')}
          className="text-blue-600 font-medium flex items-center gap-2 mb-8 cursor-pointer hover:text-blue-700 transition-colors text-sm"
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
                    ? 'bg-[#F3F4F6] text-gray-900' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
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
      <div className="flex-1 p-8 overflow-y-auto bg-white">
        {renderContent()}
      </div>
    </div>
  );
}
