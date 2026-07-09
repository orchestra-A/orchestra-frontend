import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Handles the redirect from the backend after a successful OAuth flow.
// Extracts user info from the JWT token / query params, then hydrates the
// full user profile from the backend before redirecting into the app.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();

  useEffect(() => {
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
        // Also decode the JWT to get user info if not in query params
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
        navigate('/login?error=OAuthFailed');
        return;
      }

      // signup() triggers fetchAndHydrateUser → full backend profile is loaded
      if (userId || email || username) {
        await signup({
          id: userId || `usr_${Date.now()}`,
          user_id: userId,
          email,
          username,
          platform,
        });
      }

      const isOnboarded = localStorage.getItem('onboarded') === 'true';
      if (searchParams.get('isNewUser') === 'true' || !isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    };

    setTimeout(() => {
      initSession();
    }, 1500);
  }, [navigate, searchParams, signup]);

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
