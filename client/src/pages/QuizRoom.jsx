import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { socket } from '../services/socket';
import { BarChart2, Flame, Star, Trophy, X } from 'lucide-react';

// Confetti particle component
function ConfettiParticle({ color, left, delay }) {
  return (
    <div
      className="fixed w-3 h-3 rounded-sm z-[100] pointer-events-none"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        top: '-20px',
        animation: `confetti-fall ${2 + Math.random() * 2}s linear ${delay}s forwards`,
      }}
    />
  );
}

// Gamified popup overlay
function GamePopup({ type, points, onClose }) {
  const isCorrect = type === 'correct';
  const isWinner = type === 'winner';

  useEffect(() => {
    if (!isWinner) {
      const timer = setTimeout(onClose, 1000);
      return () => clearTimeout(timer);
    }
  }, [onClose, isWinner]);

  const confettiColors = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#10B981', '#FBBF24'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti for correct/winner */}
      {(isCorrect || isWinner) && Array.from({ length: 30 }).map((_, i) => (
        <ConfettiParticle
          key={i}
          color={confettiColors[i % confettiColors.length]}
          left={Math.random() * 100}
          delay={Math.random() * 0.5}
        />
      ))}

      {/* Popup Card */}
      <div className={`animate-pop-in rounded-[28px] p-8 text-center max-w-sm w-full mx-4 pointer-events-auto relative overflow-hidden ${
        isWinner ? 'bg-gradient-to-br from-qz-gold/20 to-qz-purple/20 border-2 border-qz-gold/50' :
        isCorrect ? 'bg-gradient-to-br from-qz-green/20 to-qz-cyan/20 border-2 border-qz-green/50' :
        'bg-gradient-to-br from-qz-red/20 to-qz-pink/20 border-2 border-qz-red/50'
      } backdrop-blur-xl shadow-2xl`}>
        
        {/* Host Image */}
        <div className="w-40 h-40 mx-auto mb-4 animate-float">
          <img
            src={isWinner ? '/host/winner.png' : isCorrect ? '/host/correct.png' : '/host/wrong.png'}
            alt="Host"
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.5)]"
          />
        </div>

        <div className={`text-4xl font-black mb-2 ${isWinner ? 'text-qz-gold' : isCorrect ? 'text-qz-green-light' : 'text-qz-red'}`}>
          {isWinner ? '🏆 CHAMPION!' : isCorrect ? '🎉 Correct!' : '😢 Wrong!'}
        </div>

        <p className="text-qz-text-muted text-sm mb-4">
          {isWinner ? 'You scored the highest! Incredible performance!' : isCorrect ? `+${points} points earned!` : 'Better luck next time!'}
        </p>

        {(isCorrect || isWinner) && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: isWinner ? 5 : 3 }).map((_, i) => (
              <Star key={i} size={24} className={`${isWinner ? 'text-qz-gold' : 'text-qz-green'} animate-pop-in`} fill="currentColor" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {isWinner && (
          <button onClick={onClose} className="mt-6 btn-gold text-sm pointer-events-auto">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuizRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [hostMood, setHostMood] = useState('asking'); // asking, correct, wrong
  const [popup, setPopup] = useState(null); // { type: 'correct'|'wrong'|'winner', points }
  const [streak, setStreak] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const data = localStorage.getItem('currentQuiz');
    if (data) {
      setQuiz(JSON.parse(data));
    } else if (roomCode) {
      fetch(`http://localhost:5000/api/quiz/room/${roomCode}`)
        .then(res => res.json())
        .then(r => {
          if (r && r.quizId) {
            setQuiz(r.quizId);
            setRoomPlayers(r.players || []);
          }
        });
    } else {
      navigate('/home');
    }

    if (roomCode) {
      socket.on('room_updated', (updatedRoom) => {
        setRoomPlayers(updatedRoom.players || []);
      });
    }
    return () => { socket.off('room_updated'); };
  }, [navigate, roomCode]);

  const handleNext = useCallback(() => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
      setHostMood('asking');
    } else {
      setIsFinished(true);
      localStorage.removeItem('currentQuiz');

      // Check if winner in multiplayer
      if (roomCode && roomPlayers.length > 1) {
        const myPlayer = roomPlayers.find(p => (p.userId?._id || p.userId) === user._id);
        const maxScore = Math.max(...roomPlayers.map(p => p.score || 0));
        if (myPlayer && (myPlayer.score || 0) >= maxScore) {
          setPopup({ type: 'winner', points: score });
          setTimeout(() => navigate(`/result?score=${score}&total=${quiz.questions.length}`), 5000);
          return;
        }
      }
      setTimeout(() => navigate(`/result?score=${score}&total=${quiz.questions.length}`), 1500);
    }
  }, [quiz, currentIndex, roomCode, roomPlayers, user._id, score, navigate]);

  useEffect(() => {
    if (isFinished || !quiz) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isFinished, quiz, handleNext]);

  const handleOptionSelect = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const currentQ = quiz.questions[currentIndex];
    const isCorrect = index === currentQ.correctAnswerIndex;

    if (isCorrect) {
      const streakBonus = streak >= 3 ? 5 : 0;
      const points = 10 + timeLeft + streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setHostMood('correct');
      setPopup({ type: 'correct', points });

      if (user._id && roomCode) {
        socket.emit('room_score_update', { roomCode, userId: user._id, points });
      }
    } else {
      setStreak(0);
      setHostMood('wrong');
      setPopup({ type: 'wrong', points: 0 });
    }

    setTimeout(handleNext, 1200);
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-qz-bg flex items-center justify-center">
        <div className="text-center">
          <img src="/host/asking.png" alt="Host" className="w-48 h-48 mx-auto mb-4 animate-float object-contain" />
          <div className="animate-pulse text-qz-purple-light text-2xl font-bold">Preparing your arena...</div>
        </div>
      </div>
    );
  }

  if (isFinished && !popup) {
    return (
      <div className="min-h-screen bg-qz-bg flex items-center justify-center">
        <div className="text-center">
          <img src="/host/correct.png" alt="Host" className="w-48 h-48 mx-auto mb-4 animate-float object-contain" />
          <div className="animate-pulse text-qz-gold text-3xl font-bold">Calculating Results...</div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const optionLetters = ['A', 'B', 'C', 'D'];
  const sortedPlayers = [...roomPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />

      {/* Popup Overlay */}
      {popup && <GamePopup type={popup.type} points={popup.points} onClose={() => setPopup(null)} />}

      <div className="flex-1 flex w-full">
        {/* Main Arena */}
        <div className="flex-1 p-8 flex flex-col relative">
          
          {/* Top Bar: Progress + Timer + Streak */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-qz-text-muted">Question {currentIndex + 1}/{quiz.questions.length}</span>
                <div className="flex items-center gap-4">
                  {streak >= 2 && (
                    <div className="flex items-center gap-1 bg-qz-gold/10 border border-qz-gold/30 px-3 py-1 rounded-full animate-pop-in">
                      <Flame size={14} className="text-qz-gold" />
                      <span className="text-xs font-bold text-qz-gold">{streak}x Streak!</span>
                    </div>
                  )}
                  <span className="text-sm font-bold text-qz-purple-light">{score} PTS</span>
                </div>
              </div>
              <div className="w-full h-3 bg-qz-card rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-qz-purple to-qz-pink rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            
            <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 transition-colors ${timeLeft <= 5 ? 'bg-qz-red border-qz-red/50 animate-shake' : 'bg-qz-card border-qz-border'}`}>
              <span className="text-xl font-black text-white leading-none">{timeLeft}</span>
              <span className="text-[7px] font-bold text-white/50 tracking-widest">SEC</span>
            </div>
          </div>

          {/* Host + Question Area */}
          <div className="flex-1 flex items-center gap-8">
            
            {/* Anime Host */}
            <div className="w-64 flex-shrink-0 flex flex-col items-center">
              <div className={`transition-all duration-300 ${hostMood === 'correct' ? 'scale-110' : hostMood === 'wrong' ? 'animate-shake' : 'animate-float'}`}>
                <img
                  src={`/host/${hostMood}.png`}
                  alt="Quiz Host"
                  className="w-56 h-56 object-contain drop-shadow-[0_0_40px_rgba(124,58,237,0.4)]"
                />
              </div>
              <div className="mt-2 px-4 py-2 bg-qz-card border border-qz-border rounded-2xl text-center">
                <p className="text-xs text-qz-text-muted font-semibold">
                  {hostMood === 'asking' ? '🤔 Think carefully...' : hostMood === 'correct' ? '🎉 Amazing!' : '😅 Oops!'}
                </p>
              </div>
            </div>

            {/* Question + Options */}
            <div className="flex-1">
              {/* Category Badge */}
              <div className="mb-4 inline-flex px-4 py-1.5 bg-qz-purple/10 rounded-full border border-qz-purple/30 text-qz-purple-light text-xs font-bold tracking-widest">
                {quiz.category?.toUpperCase()}
              </div>

              {/* Question */}
              <h2 className="text-3xl font-black text-white leading-tight mb-8 drop-shadow-[0_0_20px_rgba(124,58,237,0.1)]">
                {currentQ.text}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {currentQ.options.map((opt, i) => {
                  let bgClass = 'bg-black border-[#444444] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]';
                  let textClass = 'text-white';
                  let letterColor = 'text-[#AAAAAA]';

                  if (selectedOption !== null) {
                    if (i === currentQ.correctAnswerIndex) {
                      bgClass = 'bg-white border-white shadow-[0_0_25px_rgba(255,255,255,0.5)] animate-glow-pulse';
                      textClass = 'text-black';
                      letterColor = 'text-black';
                    } else if (i === selectedOption) {
                      bgClass = 'bg-[#222222] border-[#555555] animate-shake';
                      textClass = 'text-[#AAAAAA] line-through';
                      letterColor = 'text-[#555555]';
                    } else {
                      bgClass = 'bg-black border-[#222222] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(i)}
                      disabled={selectedOption !== null}
                      className={`h-16 rounded-full flex items-center px-6 transition-all border-2 ${bgClass} disabled:cursor-default relative`}
                    >
                      <span className={`font-black text-lg mr-4 ${letterColor}`}>
                        {optionLetters[i]}:
                      </span>
                      <span className={`text-base font-semibold ${textClass}`}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[300px] bg-[#130F2D] border-l border-qz-border p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 size={20} className="text-qz-purple-light" />
            <h2 className="text-lg font-bold text-white">Live Ranks</h2>
          </div>

          <div className="space-y-3 flex-1">
            <div className="bg-qz-card border border-qz-purple/30 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-5 text-center font-black text-sm italic text-white/50">1</div>
              <div className="w-9 h-9 rounded-full bg-qz-purple/20 border border-qz-purple flex items-center justify-center text-lg shadow-[0_0_10px_rgba(124,58,237,0.5)]">👦</div>
              <div className="flex-1">
                <div className="text-xs font-bold text-qz-purple-light">You</div>
                <div className="text-[10px] font-bold text-qz-purple-light">{score} PTS</div>
              </div>
              {streak >= 2 && <Flame size={14} className="text-qz-gold" />}
            </div>

            {sortedPlayers.filter(p => {
              const pid = p.userId?._id || p.userId;
              return pid !== user._id;
            }).map((p, idx) => (
              <div key={idx} className="bg-qz-card border border-qz-border rounded-2xl p-3 flex items-center gap-3 opacity-70">
                <div className="w-5 text-center font-black text-sm italic text-white/50">{idx + 2}</div>
                <div className="w-9 h-9 rounded-full bg-qz-border flex items-center justify-center text-lg">👨</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">{p.userId?.username || 'Player'}</div>
                  <div className="text-[10px] font-bold text-qz-text-muted">{p.score || 0} PTS</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-auto bg-qz-card border border-qz-border rounded-[20px] p-5">
            <h3 className="text-xs font-bold text-qz-green tracking-widest uppercase mb-3">YOUR PROGRESS</h3>
            <div className="flex items-end justify-between mb-2">
              <div className="text-2xl font-black text-white">{score}</div>
              <div className="text-[10px] text-qz-text-muted">/ {quiz.questions.length * 25} MAX</div>
            </div>
            <div className="w-full h-2 bg-qz-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-qz-green to-qz-cyan rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (score / (quiz.questions.length * 25)) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
