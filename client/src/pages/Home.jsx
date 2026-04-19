import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { socket } from '../services/socket';
import { Rocket, Key, Users, RefreshCcw, Zap, Loader2, Gamepad2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [publicRooms, setPublicRooms] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('General Knowledge');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://hackwithit-1.onrender.com/api/quiz/rooms');
      const data = await res.json();
      setPublicRooms(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetch('https://hackwithit-1.onrender.com/api/quiz/categories').then(r => r.json()).then(setCategories);
    fetchRooms();
    socket.on('public_rooms_updated', fetchRooms);
    return () => socket.off('public_rooms_updated');
  }, []);

  const handleCreateRoom = async () => {
    if (!user._id) return navigate('/login');
    setCreating(true);
    try {
      const res = await fetch('https://hackwithit-1.onrender.com/api/quiz/room/create-with-quiz', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user._id, category: selectedCategory })
      });
      const data = await res.json();
      if (res.ok) {
        socket.emit('join_room', { roomCode: data.room.roomCode, userId: user._id });
        navigate(`/waiting/${data.room.roomCode}`);
      }
    } catch (err) { alert('Failed to create room'); }
    setCreating(false);
  };

  const handleJoinLobby = async (roomCode) => {
    if (!user._id) return navigate('/login');
    try {
      const res = await fetch('https://hackwithit-1.onrender.com/api/quiz/room/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, userId: user._id })
      });
      if (res.ok) {
        socket.emit('join_room', { roomCode, userId: user._id });
        navigate(`/waiting/${roomCode}`);
      }
    } catch (err) { alert('Failed to join room'); }
  };

  const handlePlaySolo = async (cat) => {
    const category = cat || selectedCategory;
    setCreating(true);
    try {
      const res = await fetch('https://hackwithit-1.onrender.com/api/quiz/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start quiz');
      
      localStorage.setItem('currentQuiz', JSON.stringify(data));
      navigate('/quiz');
    } catch (err) { 
      console.error(err);
      alert(err.message || 'Failed to start quiz. Please try again.'); 
    }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />

      {/* Hero Banner */}
      <div className="max-w-[1400px] w-full mx-auto px-8 pt-8 pb-4">
        <div className="relative bg-gradient-to-r from-qz-purple/20 via-qz-pink/10 to-qz-cyan/20 rounded-[28px] border border-qz-border p-8 flex items-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-qz-purple/10 rounded-full blur-[80px]"></div>
          <img src="/host/asking.png" alt="Quizfy Host" className="w-40 h-40 object-contain mr-8 animate-float drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]" />
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back, {user.username || 'Player'}! 👋</h1>
            <p className="text-qz-text-muted text-base">Ready to challenge your brain? Pick a category and start playing.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1400px] w-full mx-auto p-8 pt-4 grid grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="col-span-5 space-y-6">
          <div className="card-q">
            <h2 className="text-xl font-bold mb-2 text-white flex items-center gap-2"><Gamepad2 size={20} className="text-qz-purple-light" /> Quick Play</h2>
            <p className="text-sm text-qz-text-muted mb-5">Choose a category and jump in.</p>
            
            <div className="mb-5 relative">
              <label className="block text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-2">Category</label>
              <button onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center hover:border-qz-purple transition-colors">
                {selectedCategory} <span className="text-qz-text-muted text-xs">▼</span>
              </button>
              {showCategoryPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-qz-card border border-qz-border rounded-xl overflow-hidden z-30 shadow-2xl max-h-60 overflow-y-auto">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setShowCategoryPicker(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-qz-purple/10 transition-colors flex items-center gap-3">
                      <img src={cat.image} alt="" className="w-8 h-8 rounded-lg object-cover" /> {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={handleCreateRoom} disabled={creating}
                className="bg-gradient-to-br from-qz-purple to-qz-pink text-black rounded-2xl p-4 flex flex-col items-center justify-center font-bold tracking-wider text-xs hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50">
                {creating ? <Loader2 size={22} className="mb-1.5 animate-spin" /> : <Rocket size={22} className="mb-1.5" />}
                CREATE ROOM
              </button>
              <button onClick={() => navigate('/join')}
                className="bg-qz-card border border-qz-border text-qz-cyan-light rounded-2xl p-4 flex flex-col items-center justify-center font-bold tracking-wider text-xs hover:border-qz-cyan transition-all">
                <Key size={22} className="mb-1.5" /> JOIN CODE
              </button>
            </div>

            <button onClick={() => handlePlaySolo()} disabled={creating} className="w-full btn-gold text-sm disabled:opacity-50">
              {creating ? 'Generating...' : '⚡ PLAY SOLO'}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-7">
          <div className="card-q h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-qz-cyan flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-qz-cyan animate-pulse"></div></div>
                Public Lobbies
              </h2>
            </div>

            <div className="space-y-3 flex-1">
              {loading && <p className="text-center text-qz-text-muted py-8">Loading...</p>}
              {!loading && publicRooms.length === 0 && (
                <div className="text-center py-12 opacity-60">
                  <Users size={40} className="mx-auto mb-3 text-qz-text-muted" />
                  <p className="text-qz-text-muted text-sm">No active rooms. Create one!</p>
                </div>
              )}
              {publicRooms.map(room => (
                <div key={room._id} className="bg-qz-bg rounded-2xl p-4 flex items-center justify-between border border-qz-border hover:border-qz-purple/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-qz-purple/10 text-qz-purple-light flex items-center justify-center text-lg">
                      {room.quizId?.category === 'Science' ? '🔬' : room.quizId?.category === 'Sports' ? '⚽' : '🌍'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{room.quizId?.title || room.roomCode}</div>
                      <div className="text-xs text-qz-text-muted">{room.quizId?.category || 'General'} • AI Generated</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right"><div className="text-sm font-bold text-white">{room.players.length}/4</div><div className="text-[10px] text-qz-text-muted">Players</div></div>
                    <button onClick={() => handleJoinLobby(room.roomCode)} className="border border-qz-purple/50 text-qz-purple-light px-5 py-1.5 rounded-full text-xs font-bold hover:bg-qz-purple hover:text-white transition-colors">Join</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <button onClick={fetchRooms} className="text-qz-cyan-light text-xs font-bold flex items-center gap-2 hover:text-white transition-colors">
                <RefreshCcw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-[1400px] w-full mx-auto px-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap size={20} className="text-qz-gold" /> Browse Categories</h2>
        <div className="grid grid-cols-4 gap-5">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => handlePlaySolo(cat.name)}
              className="group card-q p-0 overflow-hidden hover:border-qz-purple/50 transition-all hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] text-left">
              <div className="h-32 overflow-hidden relative">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-qz-card via-transparent to-transparent"></div>
              </div>
              <div className="p-4">
                <div className="font-bold text-white text-sm">{cat.name}</div>
                <div className="text-[10px] text-qz-text-muted mt-1">AI Generated • 5 Questions</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
