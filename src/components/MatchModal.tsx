import { useState } from 'react';
import type { Match, Participant } from '../types';
import { X, Sword, Shield, Zap, RotateCcw, Award } from 'lucide-react';

type MatchModalProps = {
  match: Match;
  p1: Participant;
  p2: Participant;
  onClose: () => void;
  onSave: (m: Match) => void;
};

type FinishType = 'xtreme' | 'over' | 'burst' | 'spin' | 'draw';

const FINISH_POINTS: Record<Exclude<FinishType, 'draw'>, number> = {
  xtreme: 3,
  over: 2,
  burst: 2,
  spin: 1
};

const MatchModal = ({ match, p1, p2, onClose, onSave }: MatchModalProps) => {
  // Overall Match state
  const [p1Sets, setP1Sets] = useState(match.score.p1Sets);
  const [p2Sets, setP2Sets] = useState(match.score.p2Sets);
  
  // Current Set state
  const [currentP1Points, setCurrentP1Points] = useState(0);
  const [currentP2Points, setCurrentP2Points] = useState(0);
  
  // Guided state
  const [currentSet, setCurrentSet] = useState(match.score.p1Sets + match.score.p2Sets + 1);
  const [currentBeyIndex, setCurrentBeyIndex] = useState(0); // 0, 1, 2 for 3on3
  const [history, setHistory] = useState<{set: number, p1: number, p2: number, finish: string}[]>([]);

  const resetSet = () => {
    setCurrentP1Points(0);
    setCurrentP2Points(0);
    setCurrentBeyIndex(0);
  };

  const handleFinish = (winner: 'p1' | 'p2' | 'draw', type: FinishType) => {
    let p1Add = 0;
    let p2Add = 0;

    if (winner === 'p1' && type !== 'draw') p1Add = FINISH_POINTS[type];
    if (winner === 'p2' && type !== 'draw') p2Add = FINISH_POINTS[type];

    const nextP1Points = currentP1Points + p1Add;
    const nextP2Points = currentP2Points + p2Add;

    setCurrentP1Points(nextP1Points);
    setCurrentP2Points(nextP2Points);
    
    // 3on3 rotation: use next Bey (loop 0-1-2)
    setCurrentBeyIndex((prev) => (prev + 1) % 3);

    setHistory([...history, { set: currentSet, p1: p1Add, p2: p2Add, finish: type }]);

    // Check for Set win (4 points)
    if (nextP1Points >= 4) {
      const newSets = p1Sets + 1;
      setP1Sets(newSets);
      if (newSets < 2 && p2Sets < 2) {
        alert(`${p1.nickname} guanya el Set ${currentSet}!`);
        setCurrentSet(currentSet + 1);
        resetSet();
      }
    } else if (nextP2Points >= 4) {
      const newSets = p2Sets + 1;
      setP2Sets(newSets);
      if (newSets < 2 && p1Sets < 2) {
        alert(`${p2.nickname} guanya el Set ${currentSet}!`);
        setCurrentSet(currentSet + 1);
        resetSet();
      }
    }
  };

  const isMatchFinished = p1Sets >= 2 || p2Sets >= 2;

  const handleSave = () => {
    const winnerId = p1Sets >= 2 ? p1.id : (p2Sets >= 2 ? p2.id : undefined);
    
    onSave({
      ...match,
      score: { 
        p1Sets, 
        p2Sets, 
        p1Points: history.reduce((sum, h) => sum + h.p1, 0), 
        p2Points: history.reduce((sum, h) => sum + h.p2, 0) 
      },
      winnerId,
      status: winnerId ? 'finished' : 'pending'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'white' }}>
          <X size={24} />
        </button>

        <div className="text-center mb-2">
          <h2 className="impact-text text-primary">BATALLA 3on3</h2>
          <p className="impact-text" style={{ color: 'var(--color-accent-blue)' }}>Set {currentSet} - Best of 3 [4-Point]</p>
        </div>

        {/* Scoreboard */}
        <div className="flex justify-between items-center mb-2 card" style={{ background: '#000' }}>
          <div className="text-center flex-1">
            <img src={p1.avatar} alt="" style={{ width: '40px' }} />
            <div className="impact-text" style={{ fontSize: '1.2rem' }}>{p1.nickname}</div>
            <div className="text-primary impact-text" style={{ fontSize: '2rem' }}>{p1Sets}</div>
            <div style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>SETS</div>
          </div>
          
          <div className="impact-text" style={{ fontSize: '1.5rem', padding: '0 1rem' }}>VS</div>

          <div className="text-center flex-1">
            <img src={p2.avatar} alt="" style={{ width: '40px' }} />
            <div className="impact-text" style={{ fontSize: '1.2rem' }}>{p2.nickname}</div>
            <div className="text-primary impact-text" style={{ fontSize: '2rem' }}>{p2Sets}</div>
            <div style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>SETS</div>
          </div>
        </div>

        {/* Current Set Points */}
        <div className="flex justify-center gap-2 mb-2">
          <div className="card" style={{ padding: '0.5rem 1rem', borderColor: 'var(--color-primary)' }}>
            <span className="impact-text" style={{ fontSize: '1.2rem' }}>{currentP1Points}</span>
          </div>
          <div className="flex items-center impact-text" style={{ fontSize: '0.7rem' }}>PUNTS SET {currentSet}</div>
          <div className="card" style={{ padding: '0.5rem 1rem', borderColor: 'var(--color-primary)' }}>
            <span className="impact-text" style={{ fontSize: '1.2rem' }}>{currentP2Points}</span>
          </div>
        </div>

        {!isMatchFinished ? (
          <>
            <div className="text-center mb-1 impact-text" style={{ fontSize: '0.8rem' }}>
              Bey actual: <span className="text-primary">#{currentBeyIndex + 1}</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p1', 'xtreme')}
                  style={{ background: 'var(--color-primary)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <Zap size={14} /> Xtreme (3)
                </button>
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p1', 'over')}
                  style={{ background: 'var(--color-accent-blue)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <Shield size={14} /> Over (2)
                </button>
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p1', 'burst')}
                  style={{ background: 'var(--color-accent-red)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <Sword size={14} /> Burst (2)
                </button>
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p1', 'spin')}
                  style={{ background: 'var(--color-text-dim)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <RotateCcw size={14} /> Spin (1)
                </button>
              </div>
              
              <div className="text-center impact-text" style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)' }}>
                TRIAR GUANYADOR DE LA BATALLA
              </div>

              <div className="flex gap-1">
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p2', 'xtreme')}
                  style={{ background: 'var(--color-primary)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <Zap size={14} /> Xtreme (3)
                </button>
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p2', 'over')}
                  style={{ background: 'var(--color-accent-blue)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <Shield size={14} /> Over (2)
                </button>
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p2', 'burst')}
                  style={{ background: 'var(--color-accent-red)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <Sword size={14} /> Burst (2)
                </button>
                <button 
                  className="flex-1 flex flex-col items-center gap-0.5" 
                  onClick={() => handleFinish('p2', 'spin')}
                  style={{ background: 'var(--color-text-dim)', color: '#000', fontSize: '0.65rem', padding: '0.5rem 0.2rem' }}
                >
                  <RotateCcw size={14} /> Spin (1)
                </button>
              </div>
              
              <button 
                className="mt-1" 
                style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}
                onClick={() => handleFinish('draw', 'draw')}
              >
                Empat (Re-llançament)
              </button>
            </div>
          </>
        ) : (
          <div className="text-center mt-2">
            <Award size={48} className="text-primary mb-1" style={{ margin: '0 auto' }} />
            <h2 className="impact-text">PARTIT FINALITZAT</h2>
            <p className="mb-2">Guanyador: <span className="text-primary">{p1Sets >= 2 ? p1.nickname : p2.nickname}</span></p>
            <div className="flex gap-1">
              <button onClick={() => {
                if(confirm('Vols esborrar el resultat i tornar a començar aquest partit?')) {
                  setP1Sets(0);
                  setP2Sets(0);
                  setHistory([]);
                  resetSet();
                  setCurrentSet(1);
                }
              }} style={{ background: 'var(--color-accent-red)', flex: 1, fontSize: '0.8rem' }}>Corregir</button>
              <button onClick={handleSave} style={{ flex: 2 }}>Guardar i Tancar</button>
            </div>
          </div>
        )}

        <div className="mt-2" style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.7rem' }}>
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Ronda</th>
                <th>Blader</th>
                <th>Tipus</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>Set {h.set}</td>
                  <td>{h.p1 > h.p2 ? p1.nickname : (h.p2 > h.p1 ? p2.nickname : 'Empat')}</td>
                  <td style={{ textTransform: 'uppercase' }}>{h.finish}</td>
                  <td>{Math.max(h.p1, h.p2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
