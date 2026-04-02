import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTournament } from '../api';
import type { Tournament } from '../types';
import { Play, Settings } from 'lucide-react';

const Home = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const checkActive = async () => {
      const data = await getTournament();
      if (data && data.participants && data.participants.length > 0) {
        setTournament(data);
      }
    };
    checkActive();
  }, []);

  return (
    <div className="container text-center mt-2">
      <h1 className="text-primary mb-2" style={{ fontSize: '4rem', textShadow: '0 0 20px var(--color-primary-glow)' }}>BEYBLADE X</h1>
      <h2 className="mb-2 impact-text">Campionat Navarra 2026</h2>
      
      <div className="card mt-2">
        <p className="mb-2">Benvinguts al campionat definitiu de la casa rural! Estàs preparat per al Xtreme Dash?</p>
        
        <div className="flex flex-col gap-1 items-center">
          {tournament && (
            <Link to={tournament.status === 'group_stage' ? '/groups' : '/bracket'} style={{ width: '100%', maxWidth: '300px' }}>
              <button style={{ fontSize: '1.2rem', padding: '1rem 2rem', width: '100%', background: 'var(--color-accent-blue)' }} className="flex items-center justify-center gap-1">
                <Play size={24} /> Continuar Torneig
              </button>
            </Link>
          )}
          
          <Link to="/setup" style={{ width: '100%', maxWidth: '300px' }}>
            <button style={{ fontSize: tournament ? '1rem' : '1.2rem', padding: '1rem 2rem', width: '100%' }} className="flex items-center justify-center gap-1">
              <Settings size={20} /> {tournament ? 'Configuració / Nou Torneig' : 'Començar Torneig'}
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '0.5rem 1rem' }}>
          <p className="impact-text" style={{ fontSize: '0.8rem' }}>12 Bladers</p>
        </div>
        <div className="card" style={{ padding: '0.5rem 1rem' }}>
          <p className="impact-text" style={{ fontSize: '0.8rem' }}>4 Punts x Set</p>
        </div>
        <div className="card" style={{ padding: '0.5rem 1rem' }}>
          <p className="impact-text" style={{ fontSize: '0.8rem' }}>3on3 Battle</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
