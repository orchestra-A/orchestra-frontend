import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clover } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, signup } = useAuth();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingUsers, setExistingUsers] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState({});

  // Account lookup state for "Already have an account?"
  const [showAccountLookup, setShowAccountLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [matchedAccount, setMatchedAccount] = useState(null);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    // Attempt to fetch existing users to validate unique usernames
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://orchestra-backend-30fy.onrender.com/users');
        if (response.ok) {
          const data = await response.json();
          setExistingUsers(Array.isArray(data) ? data : (data.users || []));
        }
      } catch (err) {
        console.warn("Could not fetch /users, using simulated local validation", err);
        const local = JSON.parse(localStorage.getItem('users')) || [];
        setExistingUsers(local);
      }
    };
    fetchUsers();

    // If we have an email from OAuth flow, prefill it
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
    // Pre-connect the platform they logged in with if we saved it
    if (currentUser?.platform) {
      setConnectedPlatforms(prev => ({ ...prev, [currentUser.platform]: true }));
    }
  }, [currentUser]);

  const handleAccountSearch = () => {
    setLookupError('');
    setMatchedAccount(null);
    if (!lookupEmail.trim()) {
      setLookupError('Please enter a registered email address.');
      return;
    }
    const cleanSearch = lookupEmail.trim().toLowerCase();
    const found = existingUsers.find(u => u.email && u.email.toLowerCase() === cleanSearch);
    if (found) {
      setMatchedAccount(found);
    } else {
      setLookupError('No account found with this email. Please complete the registration below.');
    }
  };

  const handleConnectPlatform = (platform) => {
    setConnectedPlatforms(prev => ({ ...prev, [platform]: true }));
  };

  const handlePopupConnect = (platform, url) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(url, `Connect ${platform}`, `width=${width},height=${height},left=${left},top=${top}`);
    
    const timer = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(timer);
        setConnectedPlatforms(prev => ({ ...prev, [platform]: true }));
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !username.trim() || !email.trim()) {
      setError('Please fill out all fields.');
      return;
    }

    // Check uniqueness
    const isTaken = Array.isArray(existingUsers) ? existingUsers.some(u => u.username === username && u.id !== currentUser?.id) : false;
    if (isTaken) {
      setError('Username is already taken. Please choose another one.');
      return;
    }

    setLoading(true);
    try {
      const newUserObj = {
        id: currentUser?.id || Date.now().toString(),
        name,
        username,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const patchData = {
        name,
        username,
        email
      };
      
      try {
        const response = await fetch(`https://orchestra-backend-30fy.onrender.com/users/${newUserObj.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData)
        });
        if (!response.ok) {
          console.warn("Backend save returned status", response.status);
        }
      } catch(err) {
         console.warn("Backend save failed, continuing locally", err);
      }

      // Update local auth context
      if (currentUser) {
        await updateProfile({ name, username, email });
      } else {
        await signup({ name, username, email, id: newUserObj.id });
      }
      localStorage.setItem('onboarded', 'true');
      
      navigate('/');
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f5f2ed] text-[#1c1c1a] flex-col-reverse lg:flex-row">
      {/* Left Description Side */}
      <div className="hidden lg:flex w-1/2 bg-[#eef5eb] border-r border-[#eae6df] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5a7a4e]/5 via-transparent to-transparent"></div>

        <div className="max-w-lg relative z-10">
          <div className="absolute bottom-full left-0 mb-4 inline-flex items-center gap-2 text-[#4a4a45] font-semibold text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <Clover className="w-5 h-5 text-[#6b8f5e]" />
            Orchestra
          </div>

          <h2 className="text-4xl font-bold text-[#6b8f5e] mb-6 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Complete your profile
          </h2>
          <p className="text-lg text-[#4a4a45] leading-relaxed">
            Welcome aboard! Before you get started, please set up a unique username and confirm your email. You can connect integrated platforms at your own pace whenever you are ready.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 xl:px-16 relative bg-[#F4F1EB]">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#6b8f5e]" />
          <span className="font-semibold text-[#1c1c1a] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Orchestra</span>
        </div>

        <div className="max-w-[550px] w-full mx-auto py-8 lg:py-0">
          <h1 className="text-3xl font-bold text-[#1c1c1a] mb-2 mt-0" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Almost there!</h1>
          <p className="text-[#8a8a82] mb-4 text-base">Please provide some basic info or link an existing account.</p>

          {/* Already Have an Account Prompt Toggle */}
          <div className="mb-5 p-3.5 bg-[#eef5eb] border border-[#6b8f5e]/30 rounded-xl flex items-center justify-between shadow-sm">
            <span className="text-xs lg:text-sm font-medium text-[#2d4025]">Already have an account?</span>
            <button
              type="button"
              onClick={() => {
                setShowAccountLookup(!showAccountLookup);
                setMatchedAccount(null);
                setLookupError('');
              }}
              className="text-xs lg:text-sm text-[#6b8f5e] font-semibold underline hover:text-[#5a7a4e] transition-colors"
            >
              {showAccountLookup ? 'Create New Account' : 'Link Existing Account'}
            </button>
          </div>

          {/* Account Lookup Section */}
          {showAccountLookup && (
            <div className="p-4 bg-white border border-[#e8e4dc] rounded-2xl mb-6 space-y-3 shadow-sm">
              <h3 className="text-xs lg:text-sm font-semibold text-[#1c1c1a]">Find your registered account by email</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter registered email address"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="!bg-[#f9f7f3] border-[#e8e4dc] text-xs lg:text-sm flex-1 h-10"
                />
                <Button
                  type="button"
                  onClick={handleAccountSearch}
                  className="bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white text-xs whitespace-nowrap px-4 h-10"
                >
                  Search
                </Button>
              </div>

              {matchedAccount && (
                <div className="p-3 bg-[#eef5eb] border border-[#6b8f5e]/40 rounded-xl space-y-2.5 mt-2">
                  <p className="text-xs font-semibold text-[#2d4025]">
                    Account Found: <strong>{matchedAccount.name || matchedAccount.username || 'Registered User'}</strong> ({matchedAccount.email})
                  </p>
                  <p className="text-[11px] text-[#4a4a45]">Log in using your registered integrated platform:</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem('pre_auth_users', JSON.stringify(existingUsers));
                        window.location.href = `https://orchestra-backend-30fy.onrender.com/auth/google`;
                      }}
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs h-9 cursor-pointer"
                    >
                      Log in with Google
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem('pre_auth_users', JSON.stringify(existingUsers));
                        window.location.href = `https://orchestra-backend-30fy.onrender.com/auth/github`;
                      }}
                      className="bg-[#181717] text-white hover:bg-[#2b2a2a] text-xs h-9 cursor-pointer"
                    >
                      Log in with GitHub
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem('pre_auth_users', JSON.stringify(existingUsers));
                        window.location.href = `https://orchestra-backend-30fy.onrender.com/auth/discord`;
                      }}
                      className="bg-[#5865F2] text-white hover:bg-[#4752C4] text-xs h-9 cursor-pointer"
                    >
                      Log in with Discord
                    </Button>
                  </div>
                </div>
              )}

              {lookupError && (
                <div className="p-2 bg-red-50 text-red-600 rounded-md text-xs">
                  {lookupError}
                </div>
              )}
            </div>
          )}

          {!showAccountLookup && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm lg:text-base font-medium text-[#4a4a45]">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11 lg:h-12 text-sm lg:text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm lg:text-base font-medium text-[#4a4a45]">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  required
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11 lg:h-12 text-sm lg:text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm lg:text-base font-medium text-[#4a4a45]">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11 lg:h-12 text-sm lg:text-base"
                />
              </div>

              {/* Optional Integrations Section */}
              <div className="pt-4 border-t border-[#e8e4dc]">
                <label className="text-sm lg:text-base font-medium text-[#4a4a45] mb-2 block">Connect platforms (optional)</label>
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  {currentUser?.platform !== 'google' && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handlePopupConnect('google', `https://orchestra-backend-30fy.onrender.com/auth/google?user_id=${currentUser?.id}`)}
                      disabled={connectedPlatforms['google']}
                      className="w-full bg-white border border-[#eae6df] shadow-sm text-[#4a4a45] hover:bg-gray-50 h-11 lg:h-12 transition-all text-xs lg:text-sm"
                    >
                      {connectedPlatforms['google'] ? 'Google Connected' : 'Connect Google'}
                    </Button>
                  )}
                  
                  {currentUser?.platform !== 'discord' && (
                    <Button 
                      type="button" 
                      onClick={() => handlePopupConnect('discord', `https://orchestra-backend-30fy.onrender.com/auth/discord?user_id=${currentUser?.id}`)}
                      disabled={connectedPlatforms['discord']}
                      className="w-full bg-[#5865F2] hover:bg-[#4752C4] border-transparent shadow-sm text-white h-11 lg:h-12 transition-all text-xs lg:text-sm"
                    >
                      {connectedPlatforms['discord'] ? 'Discord Connected' : 'Connect Discord'}
                    </Button>
                  )}
                  
                  {currentUser?.platform !== 'github' && (
                    <Button 
                      type="button" 
                      onClick={() => handlePopupConnect('github', `https://orchestra-backend-30fy.onrender.com/auth/github?user_id=${currentUser?.id}`)}
                      disabled={connectedPlatforms['github']}
                      className="w-full bg-[#181717] hover:bg-[#2b2a2a] border-transparent shadow-sm text-white h-11 lg:h-12 transition-all text-xs lg:text-sm"
                    >
                      {connectedPlatforms['github'] ? 'GitHub Connected' : 'Connect GitHub'}
                    </Button>
                  )}
                </div>
              </div>

              <Button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-12 lg:h-14 mt-6 text-sm lg:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue to Dashboard'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
