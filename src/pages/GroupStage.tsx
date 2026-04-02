import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tournament, Match } from '../types';
import { calculateStandings, generateBrackets } from '../logic';
import MatchModal from '../components/MatchModal';

const GroupStage = () => {
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeGroupId, setActiveGroupId] = useState('group_A');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('beyblade_tournament');
    if (saved) {
      try {
        setTournament(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing tournament data', e);
      }
    }
  }, []);

  const saveTournament = (updated: Tournament) => {
    setTournament(updated);
    localStorage.setItem('beyblade_tournament', JSON.stringify(updated));
  };

  const handleMatchSave = (updatedMatch: Match) => {
    if (!tournament) return;
    const newMatches = tournament.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    saveTournament({ ...tournament, matches: newMatches });
    setEditingMatch(null);
  };

  const handleAdvanceToBrackets = () => {
    if (!tournament) return;
    
    const allFinished = tournament.matches.filter(m => m.stage === 'group').every(m => m.status === 'finished');
    if (!allFinished) {
      if (!confirm('No tots els partits de grup han finalitzat. Vols continuar igualment?')) return;
    }

    const updated = generateBrackets(tournament);
    saveTournament(updated);
    navigate('/bracket');
  };

  if (!tournament) return <div className="container mt-2">Carregant...</div>;

  const activeGroup = tournament.groups.find(g => g.id === activeGroupId)!;
  const groupMatches = tournament.matches.filter(m => m.groupId === activeGroupId);
  const standings = calculateStandings(tournament, activeGroupId);

  const getParticipant = (id: string) => tournament.participants.find(p => p.id === id)!;

  return (
    <div className="container mt-2">
      <h2 className="mb-2 text-primary impact-text">{tournament.title}</h2>
      
      <div className="flex gap-1 mb-2">
        {tournament.groups.map(g => (
          <button 
            key={g.id} 
            onClick={() => setActiveGroupId(g.id)}
            style={{ 
              opacity: activeGroupId === g.id ? 1 : 0.6,
              fontSize: '0.8rem'
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="card mb-2">
        <h3 className="impact-text mb-1">Classificació {activeGroup.name}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Blader</th>
                <th>PJ</th>
                <th>PG</th>
                <th>PP</th>
                <th>Sets +/-</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(s => {
                const p = getParticipant(s.participantId);
                return (
                  <tr key={s.participantId} className="standing-row">
                    <td className="flex items-center gap-1">
                      <img src={p.avatar} alt={p.nickname} style={{ width: '24px', height: '24px' }} />
                      <span className="impact-text" style={{ fontSize: '0.9rem' }}>{p.nickname}</span>
                    </td>
                    <td>{s.played}</td>
                    <td>{s.won}</td>
                    <td>{s.lost}</td>
                    <td>{s.setsWon - s.setsLost}</td>
                    <td className="text-primary impact-text">{s.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="impact-text mb-1">Partits</h3>
      <div className="flex flex-col gap-1">
        {groupMatches.map(m => {
          const p1 = getParticipant(m.p1Id);
          const p2 = getParticipant(m.p2Id);
          return (
            <div key={m.id} className="card match-item" onClick={() => setEditingMatch(m)}>
              <div className="flex items-center gap-1 flex-1">
                <span className="impact-text" style={{ fontSize: '0.8rem' }}>{p1.nickname}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>vs</span>
                <span className="impact-text" style={{ fontSize: '0.8rem' }}>{p2.nickname}</span>
              </div>
              <div className="flex items-center gap-1">
                {m.status === 'finished' ? (
                  <div className="flex items-center gap-1">
                    <span className="impact-text text-primary">{m.score.p1Sets} - {m.score.p2Sets}</span>
                    <span className="badge badge-finished">Finalitzat</span>
                  </div>
                ) : (
                  <span className="badge badge-pending">Pendent</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingMatch && (
        <MatchModal 
          match={editingMatch}
          p1={getParticipant(editingMatch.p1Id)}
          p2={getParticipant(editingMatch.p2Id)}
          onClose={() => setEditingMatch(null)}
          onSave={handleMatchSave}
        />
      )}

      <div className="mt-2 flex justify-center">
        <button 
          style={{ background: 'var(--color-accent-blue)', opacity: 0.8 }}
          onClick={handleAdvanceToBrackets}
        >
          Generar Eliminatòries
        </button>
      </div>
    </div>
  );
};

export default GroupStage;
