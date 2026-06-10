import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth(); // If we need to set local mock state

  useEffect(() => {
    // Check URL parameters for status or tokens
    const status = searchParams.get('status');
    const token = searchParams.get('token');
    
    // For demonstration, if status is success, we just route to dashboard
    // If backend returns a real JWT token, we would save it to localStorage here
    if (token) {
      localStorage.setItem('authToken', token);
    }

    // Simulate a successful login in our mock AuthContext if needed
    // In a real app, the backend handles session cookies or we set the currentUser based on JWT
    
    setTimeout(() => {
      if (status === 'error') {
        navigate('/login?error=OAuthFailed');
      } else {
        navigate('/');
      }
    }, 1500); // Small delay to show the loading screen
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f2ed] p-4">
      <div className="w-12 h-12 border-4 border-[#6b8f5e] border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-[#1c1c1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
        Authenticating...
      </h2>
      <p className="text-[#4a4a45] mt-2">Please wait while we connect your account.</p>
    </div>
  );
}
