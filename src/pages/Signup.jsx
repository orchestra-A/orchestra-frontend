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
    <div className="min-h-screen w-full flex bg-gray-50 text-gray-900 flex-col-reverse lg:flex-row">
      {/* Left Description Side */}
      <div className="hidden lg:flex w-1/2 bg-[#F8FAFC] border-r border-gray-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/5 via-transparent to-transparent"></div>
        <div className="max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm text-sm mb-6">
            <Clover className="w-4 h-4 text-[#4A90E2]" />
            Orchestra Workspace
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
          <span className="font-semibold text-gray-900 text-lg">Orchestra</span>
        </div>

        <div className="max-w-md w-full mx-auto py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-500 mb-8">Sign up to start streamlining your workflow.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <Input name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" required className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11" />
            </div>

            <Button type="submit" className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white h-11 mt-6">
              Sign Up
            </Button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Already have an account? <Link to="/login" className="text-[#4A90E2] hover:text-[#3A7BC8] font-medium transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
