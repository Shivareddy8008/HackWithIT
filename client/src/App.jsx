import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from './services/socket';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import QuizRoom from './pages/QuizRoom';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import CreateQuiz from './pages/CreateQuiz';
import JoinRoom from './pages/JoinRoom';
import WaitingRoom from './pages/WaitingRoom';
import QuizResult from './pages/QuizResult';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="min-h-screen bg-qz-bg">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/home" />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/quiz" element={isAuthenticated ? <QuizRoom /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/create-quiz" element={isAuthenticated ? <CreateQuiz /> : <Navigate to="/login" />} />
          <Route path="/join" element={isAuthenticated ? <JoinRoom /> : <Navigate to="/login" />} />
          <Route path="/waiting/:roomCode" element={isAuthenticated ? <WaitingRoom /> : <Navigate to="/login" />} />
          <Route path="/result" element={isAuthenticated ? <QuizResult /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
