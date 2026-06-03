import { useState, useEffect } from 'react';
import { Bell, Lock, User, Palette } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const { currentUser, updateProfile } = useAuth();
  
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
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <p className="text-[14px] text-gray-500 mt-1">Update your personal details here.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent text-[14px]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent text-[14px]" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={currentUser?.email || 'guest@clover.app'} 
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-[14px]" 
                />
              </div>
            </div>
            <div className="p-5 bg-[#F8F9FA] border-t border-gray-200 flex justify-end">
              <Button onClick={handleSaveProfile} className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white rounded-lg px-6">Save Changes</Button>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-[14px] text-gray-500 mt-1">Manage what we send you and when.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-[13px] text-gray-500">Receive emails about your account activity.</p>
                </div>
                <div className="w-11 h-6 bg-[#4A90E2] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">Marketing Emails</p>
                  <p className="text-[13px] text-gray-500">Receive emails about new products, features, and more.</p>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm border border-gray-100"></div>
                </div>
              </div>
            </div>
            <div className="p-5 bg-[#F8F9FA] border-t border-gray-200 flex justify-end">
              <Button className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white rounded-lg px-6">Save Changes</Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-[14px] text-gray-500 mt-1">Manage your security preferences.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-[14px] font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-[13px] text-gray-500">Add an extra layer of security to your account.</p>
                <Button className="w-fit bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Enable 2FA</Button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <p className="text-[14px] text-gray-500 mt-1">Customize how the dashboard looks on your device.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border-2 border-[#4A90E2] bg-[#4A90E2]/5 rounded-lg p-4 cursor-pointer">
                  <div className="w-full h-20 bg-white rounded border border-gray-200 mb-3 shadow-sm"></div>
                  <p className="text-sm font-semibold text-center text-[#4A90E2]">Light</p>
                </div>
                <div className="border-2 border-transparent hover:border-gray-200 rounded-lg p-4 cursor-pointer transition-colors">
                  <div className="w-full h-20 bg-gray-900 rounded border border-gray-700 mb-3 shadow-sm"></div>
                  <p className="text-sm font-medium text-center text-gray-600">Dark</p>
                </div>
                <div className="border-2 border-transparent hover:border-gray-200 rounded-lg p-4 cursor-pointer transition-colors">
                  <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded border border-gray-300 mb-3 shadow-sm"></div>
                  <p className="text-sm font-medium text-center text-gray-600">System</p>
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
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-gray-900 text-[26px] font-bold mb-2">Settings</h1>
        <p className="text-gray-500 text-[15px]">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-[220px] space-y-2 flex-shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-colors text-left ${
                  isActive
                    ? 'bg-[#EBF5FF] text-[#4A90E2]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-4xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
