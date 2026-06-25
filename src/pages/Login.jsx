import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Clover, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F4F1EB] dark:bg-[#0a100a] text-[#1c1c1a] dark:text-[#F3F7F1] relative">

      {/* Background decoration (optional, keeping it subtle) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5a7a4e]/5 via-transparent to-transparent pointer-events-none"></div>

      {/* Top bar for Back to home */}
      <div className="w-full flex justify-start p-4 lg:p-6 absolute top-0 left-0 z-50">
        <Link to="/" className="inline-flex items-center text-[#8a8a82] dark:text-[#a0a59e] hover:text-[#4a4a45] dark:hover:text-[#F3F7F1] text-base lg:text-lg transition-colors">
          <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 mr-2" /> Back to home
        </Link>
      </div>

      {/* Main Content Area - Using justify-start and pt-20 to keep a consistent, smaller gap from the top */}
      <div className="flex-1 w-full flex flex-col justify-start items-center px-8 lg:px-12 pt-20 lg:pt-24 pb-4 z-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col">

          {/* Welcome Text */}
          <h1 className="text-4xl font-bold mb-2 lg:mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Welcome,
          </h1>

          {/* Tagline */}
          <h2 className="text-4xl lg:text-5xl font-bold text-[#6b8f5e] dark:text-[#51DD15] mb-6 lg:mb-8 leading-tight max-w-5xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Streamline your development workflow.
          </h2>

          {/* Login Buttons Row */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8 lg:mb-10">
            <a href="https://orchestra-backend-30fy.onrender.com/auth/google" className="w-full block">
              <Button type="button" variant="outline" className="w-full bg-white dark:bg-[#1c2132] border border-[#eae6df] dark:border-[#2a3042] shadow-sm text-[#4a4a45] dark:text-[#F3F7F1] hover:bg-gray-50 dark:hover:bg-[#252a3a] h-16 lg:h-20 flex items-center justify-center gap-4 text-base lg:text-lg cursor-pointer transition-all">
                <svg className="w-7 h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </Button>
            </a>
            <a href="https://orchestra-backend-30fy.onrender.com/auth/discord" className="w-full block">
              <Button type="button" className="w-full bg-[#5865F2] hover:bg-[#4752C4] border-transparent shadow-sm text-white h-16 lg:h-20 flex items-center justify-center gap-4 text-base lg:text-lg cursor-pointer transition-all">
                <svg className="w-7 h-7 lg:w-8 lg:h-8" fill="white" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <span>Discord</span>
              </Button>
            </a>
            <a href="https://orchestra-backend-30fy.onrender.com/auth/github" className="w-full block">
              <Button type="button" className="w-full bg-[#181717] hover:bg-[#2b2a2a] border-transparent shadow-sm text-white h-16 lg:h-20 flex items-center justify-center gap-4 text-base lg:text-lg cursor-pointer transition-all">
                <svg className="w-7 h-7 lg:w-8 lg:h-8" fill="white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                <span>GitHub</span>
              </Button>
            </a>
            <a href="https://orchestra-backend-30fy.onrender.com/auth/figma" className="w-full block">
              <Button type="button" variant="outline" className="w-full bg-white dark:bg-[#1c2132] border border-[#eae6df] dark:border-[#2a3042] shadow-sm text-[#4a4a45] dark:text-[#F3F7F1] hover:bg-gray-50 dark:hover:bg-[#252a3a] h-16 lg:h-20 flex items-center justify-center gap-4 text-base lg:text-lg cursor-pointer transition-all">
                <svg className="w-5 h-7 lg:w-6 lg:h-8" viewBox="0 0 38 57" fill="none"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" /><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" /><path d="M19 0v19h9.5A9.5 9.5 0 1 0 19 0z" fill="#FF7262" /><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" /><path d="M0 47.5A9.5 9.5 0 0 0 9.5 57 9.5 9.5 0 0 0 19 47.5v-9.5H9.5A9.5 9.5 0 0 0 0 47.5z" fill="#0ACF83" /></svg>
                <span>Figma</span>
              </Button>
            </a>
          </div>

          {/* Centered Description Paragraph */}
          <div className="w-full flex justify-center">
            <p className="text-lg lg:text-xl text-[#4a4a45] dark:text-[#b8bcb5] leading-relaxed text-center max-w-4xl">
              Input your project details, and our platform intelligently crafts a custom, actionable plan. We track your Figma design updates, GitHub commits, and Discord conversations in real-time, automatically assigning tasks based on team skillsets to keep everyone aligned and productive.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
