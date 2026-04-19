import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) navigate('/home');
      else navigate('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-qz-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-qz-purple/10 rounded-full blur-[150px]"></div>
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-qz-pink/10 rounded-full blur-[120px]"></div>
      
      <div className="z-10 text-center animate-pop-in flex flex-col items-center">
        <Gamepad2 size={72} className="text-qz-purple-light mb-6" />
        <h1 className="text-7xl font-black bg-gradient-to-r from-qz-purple-light via-qz-pink-light to-qz-cyan-light bg-clip-text text-transparent tracking-widest uppercase italic">
          Quizfy
        </h1>
        <div className="mt-8 bg-qz-purple/20 border border-qz-purple/50 px-6 py-2 rounded-full inline-block backdrop-blur-md">
          <p className="text-sm tracking-widest font-bold text-qz-purple-light uppercase">Loading the fun...</p>
        </div>
      </div>
    </div>
  );
}
