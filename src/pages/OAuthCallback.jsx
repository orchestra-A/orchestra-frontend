import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../services/api';

// Handles the redirect from the backend after a successful OAuth flow.
// Checks if the authenticated platform account is already integrated for an
// existing user. If yes → dashboard. If no → onboarding.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-execution from React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const status = searchParams.get('status');
    const token = searchParams.get('token');

    // Extract user info from query params first
    let userId = searchParams.get('user_id');
    let username = searchParams.get('username') || '';
    let email = searchParams.get('email') || '';
    let platform = searchParams.get('platform') || '';

    if (token) {
      localStorage.setItem('authToken', token);
      try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          if (!userId && decoded.sub) userId = decoded.sub;
          if (!userId && decoded.user_id) userId = decoded.user_id;
          if (!email && decoded.email) email = decoded.email;
          if (!username && decoded.username) username = decoded.username;
          if (!platform && decoded.platform) platform = decoded.platform;
        }
      } catch (e) {
        console.warn('Could not decode token', e);
      }
    }

    const initSession = async () => {
      // If inside a popup window (from Onboarding integration linking), close it
      if (window.opener) {
        window.close();
        return;
      }

      if (status === 'error') {
        navigate('/login?error=OAuthFailed', { replace: true });
        return;
      }

      // ──────────────────────────────────────────────────────────────────
      // PLATFORM INTEGRATION & ACCOUNT LOOKUP CHECK
      // Check pre-auth snapshot cached in sessionStorage by Login / Onboarding.
      // If missing, dynamically fetch existing users from backend.
      // ──────────────────────────────────────────────────────────────────
      let integratedUser = null;
      try {
        let preAuthUsers = [];
        const cached = sessionStorage.getItem('pre_auth_users');
        if (cached) {
          try { preAuthUsers = JSON.parse(cached); } catch (e) {}
          sessionStorage.removeItem('pre_auth_users');
        }

        // Fallback: If cache was not set or empty, fetch users from API
        if (!Array.isArray(preAuthUsers) || preAuthUsers.length === 0) {
          preAuthUsers = await fetchUsers();
        }

        console.log(`[OAuthCallback] Comparing against ${preAuthUsers.length} users for platform integration`);

        if (Array.isArray(preAuthUsers) && preAuthUsers.length > 0) {
          integratedUser = preAuthUsers.find((u) => {
            // Must have completed onboarding profile (has a name or username)
            const hasProfile = Boolean((u.name && u.name.trim()) || (u.username && u.username.trim()));
            if (!hasProfile) return false;

            const connectedList = Array.isArray(u.platforms_connected) ? u.platforms_connected : [];

            // 1. Email match with registered integrated account
            if (email && u.email && u.email.toLowerCase() === email.toLowerCase()) {
              // If platform is already connected OR account has completed profile
              if (connectedList.includes(platform) || u.user_id) return true;
            }

            // 2. Platform-specific username / ID checks
            if (platform === 'github') {
              if (u.github_username && username && u.github_username.toLowerCase() === username.toLowerCase()) return true;
              if (connectedList.includes('github') && email && u.email && u.email.toLowerCase() === email.toLowerCase()) return true;
            }

            if (platform === 'discord') {
              if (u.discord_id && userId && u.discord_id.toString() === userId.toString()) return true;
              if (connectedList.includes('discord') && email && u.email && u.email.toLowerCase() === email.toLowerCase()) return true;
            }

            if (platform === 'google') {
              if (connectedList.includes('google') && email && u.email && u.email.toLowerCase() === email.toLowerCase()) return true;
            }

            return false;
          });
        }
      } catch (err) {
        console.warn('[OAuthCallback] Platform integration check warning:', err);
      }

      if (integratedUser) {
        // Existing onboarded user with this platform already linked
        console.log('[OAuthCallback] Platform already integrated for user:', integratedUser.user_id || integratedUser.id);
        localStorage.setItem('onboarded', 'true');
        await signup({
          ...integratedUser,
          id: integratedUser.user_id || integratedUser.id,
          user_id: integratedUser.user_id || integratedUser.id,
        });
        navigate('/', { replace: true });
        return;
      }

      // New user or platform not yet integrated → onboarding
      console.log('[OAuthCallback] Platform not integrated. Routing to /onboarding');
      localStorage.removeItem('onboarded');

      if (userId || email || username) {
        await signup({
          id: userId || `usr_${Date.now()}`,
          user_id: userId,
          email,
          username,
          platform,
        });
      }

      navigate('/onboarding', { replace: true });
    };

    initSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f2ed] p-4">
      <div className="w-12 h-12 border-4 border-[#6b8f5e] border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2
        className="text-xl font-bold text-[#1c1c1a]"
        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
      >
        Authenticating...
      </h2>
      <p className="text-[#4a4a45] mt-2">Please wait while we connect your account.</p>
    </div>
  );
}
