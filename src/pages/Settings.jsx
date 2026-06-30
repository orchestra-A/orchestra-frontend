import { useState, useEffect } from 'react';
import { Bell, Lock, User, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const { currentUser, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // State for Account
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  useEffect(() => {
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    await updateProfile({ name: fullName });
    alert("Profile saved successfully!");
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Profile Information</h1>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-[#1D1E1B] dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-all shadow-sm" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F4F1EB] dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-[#1D1E1B] dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-all shadow-sm" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={currentUser?.email || 'guest@clover.app'} 
                  disabled
                  className="w-full max-w-md px-4 py-2.5 bg-[#F3F7F1] dark:bg-[#18181B]/50 border border-gray-200 dark:border-[#27272A] rounded-lg text-sm text-gray-500 dark:text-white/50 shadow-sm" 
                />
              </div>
              <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white font-medium rounded-lg transition-colors text-sm shadow-sm mt-4">
                Save Changes
              </button>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Notifications</h1>

            <div className="space-y-6">
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#27272A] rounded-lg bg-[#F4F1EB] dark:bg-[#18181B] shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">Email Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Receive emails about your account activity.</p>
                </div>
                <div className="w-11 h-6 bg-[#6B905F] dark:bg-[#6B905F] rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out">
                  <div className="w-4 h-4 bg-[#F4F1EB] rounded-full absolute right-1 top-1 shadow-sm transition-transform duration-200 ease-in-out"></div>
                </div>
              </div>
              <div className="flex items-center justify-between max-w-md p-5 border border-gray-200 dark:border-[#27272A] rounded-lg bg-[#F4F1EB] dark:bg-[#18181B] shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">Marketing Emails</h3>
                  <p className="text-xs text-gray-500 dark:text-white/50">Receive emails about new products, features, and more.</p>
                </div>
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out">
                  <div className="w-4 h-4 bg-[#F4F1EB] rounded-full absolute left-1 top-1 shadow-sm border border-gray-100 dark:border-gray-600 transition-transform duration-200 ease-in-out"></div>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white font-medium rounded-lg transition-colors text-sm shadow-sm mt-4">
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="max-w-4xl">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white/90 mb-8">Appearance</h1>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => setTheme('light')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${theme === 'light' ? 'border-[#6B905F] dark:border-[#6B905F] bg-transparent' : 'border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <div className="w-full h-20 bg-white rounded border border-gray-200 dark:border-gray-700 mb-3 shadow-sm"></div>
                  <p className={`text-sm font-semibold text-center ${theme === 'light' ? 'text-[#6B905F] dark:text-[#6B905F]' : 'text-gray-600 dark:text-gray-400 dark:text-white/50'}`}>Light</p>
                </div>
                <div 
                  onClick={() => setTheme('dark')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${theme === 'dark' ? 'border-[#6B905F] dark:border-[#6B905F] bg-[#6B905F] dark:bg-[#6B905F]/5' : 'border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <div className="w-full h-20 bg-[#09090B] rounded border border-gray-700 dark:border-gray-800 mb-3 shadow-sm"></div>
                  <p className={`text-sm font-semibold text-center ${theme === 'dark' ? 'text-[#6B905F] dark:text-[#6B905F]' : 'text-gray-600 dark:text-gray-400 dark:text-white/50'}`}>Dark</p>
                </div>
                <div 
                  onClick={() => setTheme('system')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${theme === 'system' ? 'border-[#6B905F] dark:border-[#6B905F] bg-[#6B905F] dark:bg-[#6B905F]/5' : 'border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <div className="w-full h-20 bg-gradient-to-br from-white to-[#09090B] rounded border border-gray-300 dark:border-gray-600 mb-3 shadow-sm"></div>
                  <p className={`text-sm font-semibold text-center ${theme === 'system' ? 'text-[#6B905F] dark:text-[#6B905F]' : 'text-gray-600 dark:text-gray-400 dark:text-white/50'}`}>System</p>
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
        <div className="mb-8">
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">Settings</h1>
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
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#6B905F] dark:text-[#6B905F]' : 'text-[#1D1E1B] dark:text-gray-500 dark:text-white/60'} />
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
