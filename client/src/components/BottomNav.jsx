import { NavLink } from 'react-router-dom';
import { Home as IconHome, Trophy as IconTrophy, User as IconUser } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 w-full bg-white/10 backdrop-blur-xl border-t border-white/10 p-4 pb-6 flex justify-around rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
      <NavLink to="/home" className={({ isActive }) => `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-quiz-yellow bg-white/10' : 'text-white/60 hover:text-white'}`}>
        <IconHome size={28} />
      </NavLink>
      <NavLink to="/leaderboard" className={({ isActive }) => `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-quiz-yellow bg-white/10' : 'text-white/60 hover:text-white'}`}>
        <IconTrophy size={28} />
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-quiz-yellow bg-white/10' : 'text-white/60 hover:text-white'}`}>
        <IconUser size={28} />
      </NavLink>
    </div>
  );
}
