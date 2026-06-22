import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clover, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Custom component to render form labels alongside an informational tooltip
const LabelWithTooltip = ({ label, tooltip }) => (
  <div className="flex items-center gap-1.5 w-fit">
    <label className="text-sm font-medium text-[#4a4a45]">{label}</label>
    <div className="relative group flex items-center">
      <Info className="w-3 h-3 text-[#8a8a82] opacity-60 cursor-pointer transition-opacity group-hover:opacity-100" />
      <div className="absolute left-[-8px] top-full mt-2 hidden group-hover:block w-[200px] bg-[#1c1c1a] text-white text-xs rounded p-2 z-50 shadow-lg leading-relaxed font-normal">
        {tooltip}
        <div className="absolute left-[10px] bottom-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-[#1c1c1a]"></div>
      </div>
    </div>
  </div>
);

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  // Local state for managing form inputs and submission errors
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  // Update specific form fields on user input
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle user registration process
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await signup({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F1EB] dark:bg-[#1C2618] text-[#1c1c1a] dark:text-[#F3F7F1] flex-col-reverse lg:flex-row">
      {/* Left Description Side */}
      <div className="hidden lg:flex w-1/2 bg-[#eef5eb] dark:bg-[#0a100a] border-r border-[#eae6df] dark:border-[#1b261b] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5a7a4e]/5 via-transparent to-transparent"></div>

        <div className="max-w-lg relative z-10">
          <div className="absolute bottom-full left-0 mb-4 inline-flex items-center gap-2 text-[#4a4a45] dark:text-[#a0a59e] font-semibold text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <Clover className="w-5 h-5 text-[#6b8f5e] dark:text-[#51DD15]" />
            Orchestra
          </div>
          
          <h2 className="text-4xl font-bold text-[#6b8f5e] dark:text-[#51DD15] mb-6 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Streamline your development workflow.
          </h2>
          <p className="text-lg text-[#4a4a45] dark:text-[#b8bcb5] leading-relaxed">
            Input your project details, and our platform intelligently crafts a custom, actionable plan. We track your Figma design updates, GitHub commits, and Discord conversations in real-time, automatically assigning tasks based on team skillsets to keep everyone aligned and productive.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative bg-[#F4F1EB] dark:bg-[#1C2618]">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#6b8f5e] dark:text-[#51DD15]" />
          <span className="font-semibold text-[#1c1c1a] dark:text-[#F3F7F1] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Orchestra</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto py-8 lg:py-0">
          <Link to="/" className="inline-flex items-center text-[#8a8a82] dark:text-[#9095a0] hover:text-[#4a4a45] dark:hover:text-[#F3F7F1] mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
          <h1 className="text-2xl font-bold text-[#1c1c1a] dark:text-[#F3F7F1] mb-2 mt-0" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Create an Account</h1>
          <p className="text-[#8a8a82] dark:text-[#a0a5a0] mb-8 text-sm">Join Orchestra to start managing your workflow.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <LabelWithTooltip label="Name" tooltip="This name will be visible to others on your profile and projects." />
                <Input name="name" value={formData.name} onChange={handleChange} required className="!bg-[#f9f7f3] dark:!bg-[#1c2132] border-[#e8e4dc] dark:border-[#2a3042] !text-[#1c1c1a] dark:!text-[#F3F7F1] h-10" />
              </div>
              <div className="space-y-1.5">
                <LabelWithTooltip label="Username" tooltip="Choose a unique username to make your profile easily searchable." />
                <Input name="username" value={formData.username} onChange={handleChange} required className="!bg-[#f9f7f3] dark:!bg-[#1c2132] border-[#e8e4dc] dark:border-[#2a3042] !text-[#1c1c1a] dark:!text-[#F3F7F1] h-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <LabelWithTooltip label="Email" tooltip="Enter your primary work email used for project collaboration." />
              <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="!bg-[#f9f7f3] dark:!bg-[#1c2132] border-[#e8e4dc] dark:border-[#2a3042] !text-[#1c1c1a] dark:!text-[#F3F7F1] h-10" />
            </div>
            
            <div className="space-y-1.5">
              <LabelWithTooltip label="Password" tooltip="Must be at least 8 characters long, containing uppercase, lowercase, numbers, and symbols." />
              <Input name="password" type="password" value={formData.password} onChange={handleChange} required className="!bg-[#f9f7f3] dark:!bg-[#1c2132] border-[#e8e4dc] dark:border-[#2a3042] !text-[#1c1c1a] dark:!text-[#F3F7F1] h-10" />
            </div>

            <div className="space-y-1.5">
              <LabelWithTooltip label="Confirm Password" tooltip="Re-enter your password to ensure it matches." />
              <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="!bg-[#f9f7f3] dark:!bg-[#1c2132] border-[#e8e4dc] dark:border-[#2a3042] !text-[#1c1c1a] dark:!text-[#F3F7F1] h-10" />
            </div>

            <div className="flex items-center gap-2 pt-1 pb-1">
              <input type="checkbox" id="terms" required className="w-4 h-4 accent-[#6b8f5e] cursor-pointer" />
              <label htmlFor="terms" className="text-sm text-[#4a4a45] dark:text-[#a0a5a0] cursor-pointer select-none">
                I agree to the <a href="#" className="text-[#6b8f5e] hover:underline">Terms & Conditions</a>
              </label>
            </div>

            <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-10">
              Sign Up
            </Button>
          </form>

          <p className="text-center text-[#8a8a82] dark:text-[#9095a0] mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-[#6b8f5e] dark:text-[#51DD15] hover:text-[#5a7a4e] dark:hover:text-[#40bf0e] font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
