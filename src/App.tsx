import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Trophy, Users, Settings } from 'lucide-react';
import './App.css';
import Home from './pages/Home';
import Setup from './pages/Setup';
import GroupStage from './pages/GroupStage';
import Brackets from './pages/Brackets';

function App() {
  console.log('App rendering...');
  return (
    <Router>
      <div className="app-shell">
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">BEYX</Link>
            <div className="nav-links">
              <Link to="/setup" title="Configuració"><Settings size={20} /></Link>
              <Link to="/groups" title="Grups"><Users size={20} /></Link>
              <Link to="/bracket" title="Brackets"><Trophy size={20} /></Link>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/groups" element={<GroupStage />} />
            <Route path="/bracket" element={<Brackets />} />
          </Routes>
        </main>

        <footer className="main-footer">
          <p>Navarra 2026 - Beyblade X Experience</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
