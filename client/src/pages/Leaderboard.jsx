import { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import TopNav from '../components/TopNav';
import { Trophy, Flame, Crown } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => {
    socket.on('leaderboard_update', setLeaders);
    socket.emit('join_global');
    return () => socket.off('leaderboard_update');
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />
      <div className="flex-1 max-w-3xl w-full mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={28} className="text-qz-gold" />
          <h1 className="text-3xl font-black text-white">Rankings</h1>
        </div>
        <div className="card-q">
          {leaders.length > 0 ? (
            <div className="space-y-3">
              {leaders.map((u, idx) => {
                const isMe = u._id === user._id;
                return (
                  <div key={u._id} className={`bg-qz-bg rounded-2xl p-4 flex items-center justify-between border transition-colors ${isMe ? 'border-qz-purple/50' : idx === 0 ? 'border-qz-gold/50' : 'border-qz-border'} relative overflow-hidden`}>
                    {idx === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-qz-gold rounded-l-2xl"></div>}
                    {idx === 1 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-400 rounded-l-2xl"></div>}
                    {idx === 2 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l-2xl"></div>}
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center font-black text-xl italic text-white/50">{idx + 1}</div>
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 ${idx === 0 ? 'border-qz-gold bg-qz-gold/10' : 'border-qz-border bg-qz-border'}`}>
                        {idx === 0 ? <Crown size={20} className="text-qz-gold" /> : (u.avatarId === 1 ? '👨' : u.avatarId === 2 ? '👩' : '🧔')}
                      </div>
                      <div>
                        <h3 className={`font-bold ${isMe ? 'text-qz-purple-light' : 'text-white'}`}>{isMe ? 'You' : u.username}</h3>
                        <p className="text-xs text-qz-text-muted">Level {Math.floor(u.totalScore / 100) + 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${idx === 0 ? 'text-qz-gold' : 'text-qz-purple-light'}`}>{u.totalScore}</div>
                        <div className="text-[10px] text-qz-text-muted uppercase">Points</div>
                      </div>
                      {idx === 0 && <Flame size={18} className="text-qz-gold" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-qz-text-muted py-12">No players yet. Play a quiz to get on the board!</p>
          )}
        </div>
      </div>
    </div>
  );
}
