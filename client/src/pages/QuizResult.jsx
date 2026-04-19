import { useSearchParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { Home, Trophy, Star } from 'lucide-react';

export default function QuizResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '5');
  const maxScore = total * 25;
  const accuracy = Math.min(100, Math.round((score / maxScore) * 100));
  const coins = Math.floor(score / 5);

  const starCount = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg text-center animate-pop-in">
          
          <img src={accuracy >= 60 ? '/host/winner.png' : '/host/wrong.png'} alt="Host" className="w-48 h-48 mx-auto mb-4 object-contain animate-float drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]" />

          <div className="flex items-center justify-center gap-1 mb-4">
            {Array.from({ length: starCount }).map((_, i) => (
              <Star key={i} size={32} className="text-qz-gold animate-pop-in" fill="currentColor" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>

          <h1 className="text-4xl font-black text-white mb-2">{accuracy >= 80 ? 'Outstanding!' : accuracy >= 50 ? 'Good Job!' : 'Keep Trying!'}</h1>
          <p className="text-qz-text-muted mb-8">You've completed the arena.</p>

          <div className="relative mb-10 inline-block">
            <div className="w-40 h-40 rounded-full bg-qz-card border-[6px] border-qz-gold flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-glow-pulse">
              <div className="text-5xl font-black text-qz-gold">{score}</div>
            </div>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-qz-green text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">
              +{coins} Coins
            </div>
          </div>

          <div className="card-q flex justify-around p-5 mb-8">
            <div className="text-center"><div className="text-qz-text-muted text-xs uppercase tracking-wider mb-1">Accuracy</div><div className="font-bold text-xl text-qz-green-light">{accuracy}%</div></div>
            <div className="w-px bg-qz-border"></div>
            <div className="text-center"><div className="text-qz-text-muted text-xs uppercase tracking-wider mb-1">Questions</div><div className="font-bold text-xl text-qz-purple-light">{total}</div></div>
            <div className="w-px bg-qz-border"></div>
            <div className="text-center"><div className="text-qz-text-muted text-xs uppercase tracking-wider mb-1">Coins</div><div className="font-bold text-xl text-qz-gold">{coins}</div></div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/home')} className="btn-primary"><Home size={18} className="mr-2" /> Lobby</button>
            <button onClick={() => navigate('/leaderboard')} className="btn-cyan"><Trophy size={18} className="mr-2" /> Rankings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
