import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { socket } from '../services/socket';
import { ArrowLeft, Users } from 'lucide-react';

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleJoin = async () => {
    if (!roomCode || roomCode.length < 6) { setError('Enter a valid 6-character code'); return; }
    setJoining(true); setError('');
    try {
      const res = await fetch('https://hackwithit-1.onrender.com/api/quiz/room/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase(), userId: user._id })
      });
      const data = await res.json();
      if (res.ok) { socket.emit('join_room', { roomCode: data.roomCode, userId: user._id }); navigate(`/waiting/${data.roomCode}`); }
      else setError(data.error || 'Failed to join');
    } catch { setError('Network error'); }
    setJoining(false);
  };

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md card-q text-center">
          <div className="w-20 h-20 bg-qz-purple/10 border border-qz-purple/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={36} className="text-qz-purple-light" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Join Room</h2>
          <p className="text-qz-text-muted mb-8">Enter the 6-digit room code.</p>
          {error && <div className="bg-qz-red/10 border border-qz-red/30 text-qz-red px-4 py-3 rounded-xl text-sm mb-6">{error}</div>}
          <input type="text" placeholder="e.g. B5XXXY" className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-6 py-4 text-center text-2xl font-bold uppercase tracking-widest mb-8 focus:outline-none focus:border-qz-purple" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={6} />
          <button onClick={handleJoin} disabled={joining} className="btn-primary w-full disabled:opacity-50">{joining ? 'Joining...' : 'Join Game'}</button>
          <button onClick={() => navigate('/home')} className="mt-4 text-sm text-qz-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"><ArrowLeft size={14} /> Back to Lobby</button>
        </div>
      </div>
    </div>
  );
}
