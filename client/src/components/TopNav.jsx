import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Gamepad2 } from 'lucide-react';

export default function TopNav() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="w-full h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#333333] flex items-center justify-between px-8 z-50 sticky top-0">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <Gamepad2 size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wider">Quizfy</h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <NavLink to="/home" className={({ isActive }) => `text-sm font-semibold transition-colors pb-1 border-b-2 ${isActive ? 'text-qz-purple-light border-qz-purple' : 'text-qz-text-muted border-transparent hover:text-white'}`}>
            Lobby
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `text-sm font-semibold transition-colors pb-1 border-b-2 ${isActive ? 'text-qz-purple-light border-qz-purple' : 'text-qz-text-muted border-transparent hover:text-white'}`}>
            Rankings
          </NavLink>
          <NavLink to="/create-quiz" className={({ isActive }) => `text-sm font-semibold transition-colors pb-1 border-b-2 ${isActive ? 'text-qz-purple-light border-qz-purple' : 'text-qz-text-muted border-transparent hover:text-white'}`}>
            Create Quiz
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user.username && (
          <span className="text-sm text-qz-text-muted font-medium">
            {user.username}
          </span>
        )}
        <NavLink to="/profile">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-qz-purple to-qz-pink p-[2px] cursor-pointer hover:shadow-[0_0_12px_rgba(124,58,237,0.5)] transition-shadow">
            <div className="w-full h-full bg-qz-bg rounded-full flex items-center justify-center text-sm">👨</div>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-qz-card border border-qz-border flex items-center justify-center text-qz-text-muted hover:text-qz-red hover:border-qz-red/50 transition-colors" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
