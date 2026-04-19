import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) { const p = JSON.parse(data); setUser(p); setName(p.username || ''); }
  }, []);

  const handleSave = () => {
    if (user) { const updated = { ...user, username: name }; localStorage.setItem('user', JSON.stringify(updated)); }
    navigate('/home');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-qz-purple/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-lg bg-qz-card rounded-[24px] border border-qz-border p-10 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-qz-purple-light to-qz-pink-light bg-clip-text text-transparent mb-3">Your Profile</h1>
          <p className="text-qz-text-muted">Personalize your Quizfy experience.</p>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-qz-bg border border-qz-border flex items-center justify-center mb-4 cursor-pointer hover:border-qz-purple transition-colors">
            <Camera size={28} className="text-qz-purple-light opacity-60" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-qz-purple-light tracking-widest uppercase mb-2">Full Name</label>
            <input type="text" className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-qz-purple-light tracking-widest uppercase mb-2">Bio</label>
            <textarea className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple resize-none h-28" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} maxLength={150} />
            <div className="text-right text-xs text-qz-text-muted mt-2">{bio.length}/150</div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button onClick={handleSave} className="btn-primary px-12">Save & Play <ArrowRight size={18} className="ml-2" /></button>
        </div>
      </div>
    </div>
  );
}
