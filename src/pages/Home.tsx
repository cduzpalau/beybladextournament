import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container text-center mt-2">
      <h1 className="text-primary mb-2" style={{ fontSize: '4rem', textShadow: '0 0 20px var(--color-primary-glow)' }}>BEYBLADE X</h1>
      <h2 className="mb-2 impact-text">Campionat Navarra 2026</h2>
      <div className="card mt-2">
        <p className="mb-2">Benvinguts al campionat definitiu de la casa rural! Estàs preparat per al Xtreme Dash?</p>
        <Link to="/setup">
          <button style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>Començar Torneig</button>
        </Link>
      </div>
      <div className="mt-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
