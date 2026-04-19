import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { ArrowLeft, Plus, Save, Loader2 } from 'lucide-react';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);

  const handleAddQuestion = () => setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
  const handleQuestionChange = (i, f, v) => { const q = [...questions]; q[i][f] = v; setQuestions(q); };
  const handleOptionChange = (qi, oi, v) => { const q = [...questions]; q[qi].options[oi] = v; setQuestions(q); };

  const handleSave = async () => {
    if (!category || !title) return alert("Category and Title required");
    const user = JSON.parse(localStorage.getItem('user'));
    setSaving(true);
    try {
      const res = await fetch('https://hackwithit-1.onrender.com/api/quiz/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title, questions, creatorId: user._id })
      });
      if (res.ok) { alert("Quiz Created!"); navigate('/home'); }
    } catch { alert('Failed to save'); }
    setSaving(false);
  };

  const optColors = ['border-qz-purple/30', 'border-qz-cyan/30', 'border-qz-pink/30', 'border-qz-gold/30'];

  return (
    <div className="min-h-screen bg-qz-bg flex flex-col">
      <TopNav />
      <div className="flex-1 max-w-3xl w-full mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-qz-card border border-qz-border rounded-full flex items-center justify-center hover:border-qz-purple transition-colors"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold">Create Quiz</h1>
        </div>
        <div className="space-y-6">
          <div><label className="block text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-2">Category</label><input placeholder="e.g. History" className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple" value={category} onChange={e => setCategory(e.target.value)} /></div>
          <div><label className="block text-[10px] font-bold text-qz-text-muted tracking-widest uppercase mb-2">Title</label><input placeholder="A catchy title" className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-qz-purple" value={title} onChange={e => setTitle(e.target.value)} /></div>
          {questions.map((q, qi) => (
            <div key={qi} className="card-q">
              <h3 className="font-bold mb-4 text-qz-purple-light">Question {qi + 1}</h3>
              <input placeholder="Question text..." className="w-full bg-qz-bg text-white border border-qz-border rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-qz-purple" value={q.text} onChange={e => handleQuestionChange(qi, 'text', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`c-${qi}`} checked={q.correctAnswerIndex === oi} onChange={() => handleQuestionChange(qi, 'correctAnswerIndex', oi)} className="accent-qz-gold w-4 h-4" />
                    <input placeholder={`Option ${String.fromCharCode(65 + oi)}`} className={`flex-1 bg-qz-bg text-white border ${optColors[oi]} rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-qz-purple`} value={opt} onChange={e => handleOptionChange(qi, oi, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleAddQuestion} className="w-full bg-qz-card border border-dashed border-qz-border text-qz-text-muted rounded-2xl flex items-center justify-center gap-2 py-4 hover:border-qz-purple hover:text-white transition-all"><Plus size={20} /> Add Question</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-6 disabled:opacity-50">{saving ? <><Loader2 size={18} className="mr-2 animate-spin" /> Saving...</> : <><Save size={18} className="mr-2" /> Save Quiz</>}</button>
        </div>
      </div>
    </div>
  );
}
