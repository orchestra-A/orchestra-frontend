import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clover } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      // App.jsx will automatically handle the redirect because of PublicRoute
      // or we can explicitly navigate
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 text-gray-900 flex-col-reverse lg:flex-row">
      {/* Left Description Side */}
      <div className="hidden lg:flex w-1/2 bg-[#F8FAFC] border-r border-gray-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/5 via-transparent to-transparent"></div>
        <div className="max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm text-sm mb-6">
            <Clover className="w-4 h-4 text-[#4A90E2]" />
            Clover Workspace
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline your development workflow.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Input your project details, and our platform intelligently crafts a custom, actionable plan. We track your Figma design updates and GitHub commits in real-time, automatically assigning tasks based on team skillsets to keep everyone aligned and productive.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative bg-white">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#4A90E2]" />
          <span className="font-semibold text-gray-900 text-lg">Clover</span>
        </div>

        <div className="max-w-md w-full mx-auto py-12 lg:py-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Enter your details to access your dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email or Username</label>
              <Input 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username" 
                required 
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" 
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-[#4A90E2] hover:text-[#3A7BC8] transition-colors">Forgot password?</Link>
              </div>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" 
              />
            </div>

            <Button type="submit" className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white h-11 mt-6">
              Sign In
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full bg-white border border-gray-300 shadow-sm text-gray-700 hover:bg-gray-50 h-11 cursor-pointer transition-all">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Don't have an account? <Link to="/signup" className="text-[#4A90E2] hover:text-[#3A7BC8] font-medium transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
