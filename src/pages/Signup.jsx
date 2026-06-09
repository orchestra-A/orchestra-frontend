import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clover } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    <div className="min-h-screen w-full flex bg-[#f5f2ed] text-[#1c1c1a] flex-col-reverse lg:flex-row">
      {/* Left Description Side */}
      <div className="hidden lg:flex w-1/2 bg-[#eef5eb] border-r border-[#eae6df] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5a7a4e]/5 via-transparent to-transparent"></div>
        <div className="max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#eae6df] text-[#4a4a45] shadow-sm text-sm mb-6">
            <Clover className="w-4 h-4 text-[#6b8f5e]" />
            Orchestra Workspace
          </div>
          <h2 className="text-4xl font-bold text-[#6b8f5e] mb-6 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Streamline your development workflow.
          </h2>
          <p className="text-lg text-[#4a4a45] leading-relaxed">
            Input your project details, and our platform intelligently crafts a custom, actionable plan. We track your Figma design updates and GitHub commits in real-time, automatically assigning tasks based on team skillsets to keep everyone aligned and productive.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative bg-white">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Clover className="w-6 h-6 text-[#6b8f5e]" />
          <span className="font-semibold text-[#1c1c1a] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Orchestra</span>
        </div>

        <div className="max-w-md w-full mx-auto py-12">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-8" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Create an Account</h1>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">Username</label>
                <Input name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" required className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#4a4a45]">Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#4a4a45]">Password</label>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#4a4a45]">Confirm Password</label>
              <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" />
            </div>

            <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-11 mt-6">
              Sign Up
            </Button>
          </form>

          <p className="text-center text-[#8a8a82] mt-8 text-sm">
            Already have an account? <Link to="/login" className="text-[#6b8f5e] hover:text-[#5a7a4e] font-medium transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
