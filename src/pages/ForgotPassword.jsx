import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clover, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f2ed] p-4 relative">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Clover className="w-6 h-6 text-[#6b8f5e]" />
        <span className="font-semibold text-[#1c1c1a] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Orchestra</span>
      </div>

      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#eae6df] shadow-sm">
        {step === 1 && (
          <div>
            <Link to="/login" className="inline-flex items-center text-[#8a8a82] hover:text-[#4a4a45] mb-6 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
            </Link>
            <h1 className="text-2xl font-bold text-[#1c1c1a] mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Reset your password</h1>
            <p className="text-[#4a4a45] mb-6 text-sm">Enter the email address associated with your account and we'll send you a One-Time Password (OTP) to reset it.</p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" 
                />
              </div>
              <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-11 mt-4">
                Send OTP
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="inline-flex items-center text-[#8a8a82] hover:text-[#4a4a45] mb-6 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <h1 className="text-2xl font-bold text-[#1c1c1a] mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Enter Verification Code</h1>
            <p className="text-[#4a4a45] mb-6 text-sm">We've sent a 6-digit code to <span className="text-[#1c1c1a] font-medium">{email || 'your email'}</span>.</p>
            
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">One-Time Password</label>
                <Input 
                  type="text" 
                  placeholder="123456" 
                  required 
                  maxLength={6}
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11 tracking-widest text-center text-lg" 
                />
              </div>
              <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-11 mt-4">
                Verify Code
              </Button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-[#1c1c1a] mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Create new password</h1>
            <p className="text-[#4a4a45] mb-6 text-sm">Your new password must be different from previous used passwords.</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">New Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">Confirm New Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] placeholder:text-[#8a8a82] h-11" 
                />
              </div>
              <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-11 mt-4">
                Reset Password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
