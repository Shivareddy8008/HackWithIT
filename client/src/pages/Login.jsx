import { useState } from 'react';
import { socket } from '../services/socket';
import { Gamepad2, ArrowRight } from 'lucide-react';

export default function Login({ setAuth }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [step, setStep] = useState(1);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return;
    const res = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    if (res.ok) setStep(2);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, username: username || 'Player' })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(true);
      socket.connect();
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col items-center justify-center relative p-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-qz-purple/8 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-qz-pink/8 rounded-full blur-[80px]"></div>

      <div className="flex items-center gap-2 mb-12 z-10">
        <Gamepad2 size={32} className="text-qz-purple-light" />
        <h1 className="text-3xl font-black bg-gradient-to-r from-qz-purple-light to-qz-pink-light bg-clip-text text-transparent tracking-wider">Quizfy</h1>
      </div>

      <div className="w-full max-w-sm bg-qz-card rounded-[24px] border border-qz-border shadow-2xl z-10 overflow-hidden relative">
        <div className="h-1 w-full bg-gradient-to-r from-qz-purple to-qz-pink"></div>
        
        <div className="p-8">
          <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
          <p className="text-qz-text-muted text-sm mb-8">Enter your phone number to start playing.</p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter phone number" 
                  className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple transition-colors" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>
              <button className="btn-primary w-full">
                SEND OTP <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-2">Username</label>
                <input type="text" className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-2">OTP (use 1234)</label>
                <input type="text" className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple tracking-widest font-mono" value={otp} onChange={e => setOtp(e.target.value)} />
              </div>
              <button className="btn-primary w-full">
                VERIFY <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          )}

          <p className="text-center text-xs text-qz-text-muted mt-8 opacity-60">
            By continuing, you agree to our <span className="text-qz-purple-light">Terms</span> and <span className="text-qz-purple-light">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
