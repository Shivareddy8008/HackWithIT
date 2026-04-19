import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import TopNav from '../components/TopNav';
import { Play, User as UserIcon, Copy, Check } from 'lucide-react';

export default function WaitingRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetch(`https://hackwithit-1.onrender.com/api/quiz/room/${roomCode}`).then(r => r.json()).then(d => { setRoom(d); socket.emit('join_room', { roomCode, userId: user._id }); });
    socket.on('room_updated', setRoom);
    socket.on('quiz_started', () => {
      fetch(`https://hackwithit-1.onrender.com/api/quiz/room/${roomCode}`).then(r => r.json()).then(d => { if (d.quizId) localStorage.setItem('currentQuiz', JSON.stringify(d.quizId)); navigate(`/quiz?room=${roomCode}`); });
    });
    return () => { socket.off('room_updated'); socket.off('quiz_started'); };
  }, [roomCode, navigate, user._id]);

  const handleCopy = () => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleStart = () => socket.emit('start_quiz', { roomCode });

  if (!room) return <div className="min-h-screen bg-qz-bg flex items-center justify-center"><div className="animate-pulse text-qz-purple-light text-xl font-bold">Connecting...</div></div>;

  const isHost = (room.hostId?._id || room.hostId) === user._id;

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <div className="card-q text-center mb-8">
            <img src="/host/asking.png" alt="Host" className="w-32 h-32 mx-auto mb-4 object-contain animate-float" />
            <h1 className="text-2xl font-bold text-white mb-2">Waiting Room</h1>
            <p className="text-qz-text-muted mb-6">Share the code with friends</p>
            <div className="bg-qz-bg rounded-2xl p-5 flex items-center justify-between border border-qz-border">
              <div><div className="text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-1">Room Code</div><div className="text-3xl font-black tracking-[0.3em] text-qz-gold">{roomCode}</div></div>
              <button onClick={handleCopy} className="w-11 h-11 bg-qz-purple/10 border border-qz-purple/30 rounded-xl flex items-center justify-center hover:bg-qz-purple/20 transition-colors">
                {copied ? <Check size={18} className="text-qz-green" /> : <Copy size={18} className="text-qz-purple-light" />}
              </button>
            </div>
            <div className="mt-3 text-xs text-qz-text-muted">Category: <span className="text-qz-pink-light font-bold">{room.quizId?.category || 'General'}</span></div>
          </div>
          <div className="card-q">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">Squad</h2>
              <span className="text-xs font-bold text-qz-cyan bg-qz-cyan/10 px-3 py-1 rounded-full">{room.players.length}/4</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Array.from({ length: 4 }).map((_, idx) => {
                const player = room.players[idx];
                if (player) {
                  const pUser = player.userId; const pId = pUser?._id || pUser; const isMe = pId === user._id;
                  return (
                    <div key={idx} className={`bg-qz-bg rounded-2xl p-3 flex items-center gap-3 border ${isMe ? 'border-qz-purple/50' : 'border-qz-border'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${isMe ? 'border-qz-purple bg-qz-purple/20' : 'border-qz-border bg-qz-border'}`}>👦</div>
                      <div><div className="text-sm font-bold text-white">{isMe ? 'You' : pUser?.username || 'Player'}</div><div className={`text-[10px] font-bold ${(pId === (room.hostId?._id || room.hostId)) ? 'text-qz-gold' : 'text-qz-text-muted'}`}>{pId === (room.hostId?._id || room.hostId) ? 'Host' : 'Ready'}</div></div>
                    </div>
                  );
                }
                return <div key={idx} className="bg-qz-bg border border-qz-border rounded-2xl p-3 flex flex-col items-center justify-center opacity-40 h-16"><UserIcon size={18} className="mb-1" /><div className="text-[10px]">Waiting...</div></div>;
              })}
            </div>
            {isHost ? (
              <button onClick={handleStart} className="w-full btn-primary text-sm tracking-widest"><Play size={16} fill="currentColor" className="mr-2" /> START GAME</button>
            ) : (
              <div className="text-center p-3 bg-qz-bg rounded-2xl border border-qz-border">
                <div className="flex items-center justify-center gap-2 mb-1"><div className="w-2 h-2 bg-qz-gold rounded-full animate-pulse"></div><div className="w-2 h-2 bg-qz-gold rounded-full animate-pulse"></div><div className="w-2 h-2 bg-qz-gold rounded-full animate-pulse"></div></div>
                <p className="text-sm text-qz-text-muted">Waiting for host...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
