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
            Streamline your development workflow.
          </h2>
          <p className="text-lg text-[#4a4a45] leading-relaxed">
            Input your project details, and our platform intelligently crafts a custom, actionable plan. We track your Figma design updates, GitHub commits, and Discord conversations in real-time, automatically assigning tasks based on team skillsets to keep everyone aligned and productive.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative bg-[#F4F1EB]">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#6b8f5e]" />
          <span className="font-semibold text-[#1c1c1a] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Orchestra</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto py-8 lg:py-0">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-6 mt-0" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Welcome Back</h1>

          <form onSubmit={handleLogin} className="space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#4a4a45]">Email or Username</label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                required
                className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#4a4a45]">Password</label>
                <Link to="/forgot-password" className="text-sm text-[#6b8f5e] hover:text-[#5a7a4e] transition-colors">Forgot password?</Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-10"
              />
            </div>

            <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-10 mt-4">
              Sign In
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#eae6df]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F4F1EB] text-[#8a8a82]">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a href="https://orchestra-backend-2v5a.onrender.com/auth/google" className="w-full block">
                <Button type="button" variant="outline" className="w-full bg-white border border-[#eae6df] shadow-sm text-[#4a4a45] hover:bg-gray-50 h-10 cursor-pointer transition-all">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
              </a>
              <a href="https://orchestra-backend-2v5a.onrender.com/auth/discord" className="w-full block">
                <Button type="button" className="w-full bg-[#5865F2] hover:bg-[#4752C4] border-transparent shadow-sm text-white h-10 cursor-pointer transition-all">
                  <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Discord
                </Button>
              </a>
              <a href="https://orchestra-backend-2v5a.onrender.com/auth/github" className="w-full block">
                <Button type="button" className="w-full bg-[#181717] hover:bg-[#2b2a2a] border-transparent shadow-sm text-white h-10 cursor-pointer transition-all">
                  <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  GitHub
                </Button>
              </a>
              <a href="https://orchestra-backend-2v5a.onrender.com/auth/figma" className="w-full block">
                <Button type="button" className="w-full bg-[#0f95c8] hover:bg-[#0c7da8] border-transparent shadow-sm text-white h-10 cursor-pointer transition-all">
                  <svg className="w-4 h-5 mr-2" viewBox="0 0 38 57" fill="none"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/><path d="M19 0v19h9.5A9.5 9.5 0 1 0 19 0z" fill="#FF7262"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/><path d="M0 47.5A9.5 9.5 0 0 0 9.5 57 9.5 9.5 0 0 0 19 47.5v-9.5H9.5A9.5 9.5 0 0 0 0 47.5z" fill="#0ACF83"/></svg>
                  Figma
                </Button>
              </a>
            </div>
          </form>

          <p className="text-center text-[#8a8a82] mt-6 text-sm">
            Don't have an account? <Link to="/signup" className="text-[#6b8f5e] hover:text-[#5a7a4e] font-medium transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
