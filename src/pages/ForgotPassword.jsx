import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clover, ArrowLeft, Info } from 'lucide-react';

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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const censorEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr || 'your email';
    const [local, domain] = emailStr.split('@');
    if (local.length <= 6) {
      if (local.length <= 2) return `***@${domain}`;
      return `${local[0]}***${local[local.length - 1]}@${domain}`;
    }
    return `${local.substring(0, 3)}***${local.substring(local.length - 3)}@${domain}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

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
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <Clover className="w-6 h-6 text-[#6b8f5e]" />
        <span className="font-semibold text-[#1c1c1a] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Orchestra</span>
      </div>

      <div className="max-w-md w-full bg-[#F4F1EB] p-8 rounded-2xl border border-[#eae6df] shadow-sm">
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
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] h-11" 
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
            <p className="text-[#4a4a45] mb-6 text-sm">We've sent a 6-digit code to <span className="text-[#1c1c1a] font-medium">{email ? censorEmail(email) : 'your email'}</span>.</p>
            
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#4a4a45]">One-Time Password</label>
                <div className="flex items-center justify-between !bg-[#f9f7f3] dark:!bg-[#f9f7f3] border border-[#e8e4dc] rounded-md h-11 px-2 focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring transition-all">
                  {otp.map((digit, i) => (
                    <input 
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text" 
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      placeholder="___"
                      className="bg-transparent outline-none w-full text-center text-lg font-medium text-[#1c1c1a] placeholder:text-[#8a8a82]" 
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6b8f5e] hover:bg-[#5a7a4e] text-white h-11 mt-4" disabled={otp.some(d => !d)}>
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
                <LabelWithTooltip label="New Password" tooltip="Must be at least 8 characters long, containing uppercase, lowercase, numbers, and symbols." />
                <Input 
                  type="password" 
                  required 
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] h-11" 
                />
              </div>
              <div className="space-y-1.5">
                <LabelWithTooltip label="Confirm New Password" tooltip="Re-enter your password to ensure it matches." />
                <Input 
                  type="password" 
                  required 
                  className="!bg-[#f9f7f3] dark:!bg-[#f9f7f3] border-[#e8e4dc] !text-[#1c1c1a] dark:!text-[#1c1c1a] h-11" 
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
