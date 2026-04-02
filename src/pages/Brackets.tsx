import { useEffect, useState } from 'react';
import type { Tournament, Match } from '../types';
import { advanceKnockout } from '../logic';
import MatchModal from '../components/MatchModal';
import { Trophy, Loader2 } from 'lucide-react';
import { getTournament, saveTournament as apiSaveTournament } from '../api';
import { useNavigate } from 'react-router-dom';

const Brackets = () => {
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getTournament();
      if (data) setTournament(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const saveTournament = async (updated: Tournament) => {
    setSaving(true);
    setTournament(updated);
    await apiSaveTournament(updated);
    setSaving(false);
  };

  const handleMatchSave = async (updatedMatch: Match) => {
    if (!tournament) return;
    let newMatches = tournament.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    let updatedTournament = { ...tournament, matches: newMatches };
    
    updatedTournament = advanceKnockout(updatedTournament);
    
    await saveTournament(updatedTournament);
    setEditingMatch(null);
  };

  if (loading) return (
    <div className="container mt-2 flex flex-col items-center">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="mt-1 impact-text">Carregant eliminatòries...</p>
    </div>
  );

  if (!tournament) return (
    <div className="container mt-2 text-center">
      <p className="mb-2">No s'ha trobat cap torneig actiu.</p>
      <button onClick={() => navigate('/setup')}>Anar a Configuració</button>
    </div>
  );

  const knockoutMatches = tournament.matches.filter(m => m.stage === 'knockout');
  const rounds = Array.from(new Set(knockoutMatches.map(m => m.round || 0))).sort((a, b) => a - b);

  const getParticipant = (id: string) => tournament.participants.find(p => p.id === id)!;

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds && round > 1) return 'Gran Final';
    if (round === totalRounds - 1 && round > 0) return 'Semifinals';
    if (round === 1) return 'Quarts de Final';
    return `Ronda ${round}`;
  };

  return (
    <div className="container mt-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-primary impact-text">Fase Final</h2>
        {saving && <Loader2 className="animate-spin text-primary" size={20} />}
      </div>
      
      {rounds.length === 0 && (
        <div className="card text-center">
          <p>Encara no s'han generat les eliminatòries.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>Acaba la fase de grups primer.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rounds.map(r => (
          <div key={r} className="mb-2">
            <h3 className="impact-text mb-1" style={{ color: 'var(--color-accent-blue)' }}>
              {getRoundName(r, rounds.length)}
            </h3>
            <div className="flex flex-col gap-1">
              {knockoutMatches.filter(m => m.round === r).map(m => {
                const p1 = getParticipant(m.p1Id);
                const p2 = getParticipant(m.p2Id);
                return (
                  <div key={m.id} className="card match-item" onClick={() => setEditingMatch(m)}>
                    <div className="flex items-center gap-1 flex-1">
                      <div className={`flex items-center gap-1 ${m.winnerId === p1.id ? 'text-primary' : ''}`}>
                        <img src={p1.avatar} alt={p1.nickname} style={{ width: '20px' }} />
                        <span className="impact-text" style={{ fontSize: '0.8rem' }}>{p1.nickname}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>vs</span>
                      <div className={`flex items-center gap-1 ${m.winnerId === p2.id ? 'text-primary' : ''}`}>
                        <img src={p2.avatar} alt={p2.nickname} style={{ width: '20px' }} />
                        <span className="impact-text" style={{ fontSize: '0.8rem' }}>{p2.nickname}</span>
                      </div>
                    </div>
                    <div>
                      {m.status === 'finished' ? (
                        <span className="impact-text text-primary">{m.score.p1Sets} - {m.score.p2Sets}</span>
                      ) : (
                        <span className="badge badge-pending">Pendent</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {tournament.status === 'finished' && (
        <div className="card mt-2 text-center" style={{ borderColor: 'var(--color-primary)', borderWidth: '2px' }}>
          <Trophy size={48} className="text-primary mb-1" style={{ margin: '0 auto' }} />
          <h2 className="impact-text text-primary">Tenim Campió!</h2>
          {(() => {
            const finalMatch = knockoutMatches.find(m => m.round === rounds.length);
            if (!finalMatch || !finalMatch.winnerId) return null;
            const winner = getParticipant(finalMatch.winnerId);
            return (
              <div className="mt-1">
                <img src={winner.avatar} alt={winner.nickname} style={{ width: '100px' }} />
                <h1 className="impact-text">{winner.nickname}</h1>
              </div>
            );
          })()}
        </div>
      )}

      {editingMatch && (
        <MatchModal 
          match={editingMatch}
          p1={getParticipant(editingMatch.p1Id)}
          p2={getParticipant(editingMatch.p2Id)}
          onClose={() => setEditingMatch(null)}
          onSave={handleMatchSave}
        />
      )}
    </div>
  );
};

export default Brackets;
