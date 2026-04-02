import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PREDEFINED_PARTICIPANTS } from '../constants';
import type { Participant, Tournament } from '../types';
import { Save, Download, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { getTournament, saveTournament as apiSaveTournament } from '../api';
import { generateTournament } from '../logic';

const Setup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('Campionat de Navarra 2026');
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [hasExisting, setHasExisting] = useState(false);
  const [existingTournament, setExistingTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const tournament = await getTournament();
      if (tournament && tournament.participants) {
        setExistingTournament(tournament);
        setTitle(tournament.title);
        const existingNicknames: Record<string, string> = {};
        tournament.participants.forEach(p => {
          existingNicknames[p.name] = p.nickname;
        });
        setNicknames(existingNicknames);
        setHasExisting(true);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleNicknameChange = (name: string, nickname: string) => {
    setNicknames(prev => ({ ...prev, [name]: nickname }));
  };

  const getAvatarUrl = (nickname: string) => {
    const seed = nickname || 'default';
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const handleStartTournament = async () => {
    const participants: Participant[] = PREDEFINED_PARTICIPANTS.map(p => ({
      id: p.name.toLowerCase(),
      name: p.name,
      nickname: nicknames[p.name] || p.name,
      avatar: getAvatarUrl(nicknames[p.name]),
      age: p.age
    }));

    if (hasExisting && !confirm('Això regenerarà el torneig COMPLETAMENT (grups i partits) i esborrarà el progrés actual. Estàs segur?')) {
      return;
    }

    setSaving(true);
    const tournament = generateTournament(title, participants);
    await apiSaveTournament(tournament);
    setSaving(false);
    navigate('/groups');
  };

  const handleUpdateOnly = async () => {
    if (!existingTournament) return;

    const updatedParticipants = existingTournament.participants.map(p => ({
      ...p,
      nickname: nicknames[p.name] || p.nickname,
      avatar: getAvatarUrl(nicknames[p.name] || p.nickname)
    }));

    const updated: Tournament = {
      ...existingTournament,
      title,
      participants: updatedParticipants
    };

    setSaving(true);
    await apiSaveTournament(updated);
    setSaving(false);
    alert('Dades actualitzades!');
    navigate('/groups');
  };

  const handleExport = () => {
    if (!existingTournament) return;
    const blob = new Blob([JSON.stringify(existingTournament)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torneig-beyblade-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.participants && json.matches) {
          setSaving(true);
          await apiSaveTournament(json);
          setSaving(false);
          window.location.reload();
        } else {
          alert('Format de fitxer invàlid');
        }
      } catch (err) {
        alert('Error llegint el fitxer');
      }
    };
    reader.readAsText(file);
  };

  if (loading) return (
    <div className="container mt-2 flex flex-col items-center">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="mt-1 impact-text">Carregant dades...</p>
    </div>
  );

  return (
    <div className="container mt-2">
      <h2 className="mb-2 text-primary impact-text">Configuració del Torneig</h2>
      
      <div className="flex gap-1 mb-2">
        <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-0.5" style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontSize: '0.7rem' }}>
          <Download size={14} /> Exportar JSON
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-0.5" style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontSize: '0.7rem' }}>
          <Upload size={14} /> Importar JSON
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} accept=".json" />
      </div>

      <div className="card mb-2">
        <label className="mb-1 impact-text" style={{ display: 'block' }}>Títol del Campionat</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Gran Torneig de la Casa Rural"
          disabled={saving}
        />
      </div>

      <h3 className="mb-1 impact-text">Bladers Participants</h3>
      <div className="setup-grid">
        {PREDEFINED_PARTICIPANTS.map((p) => (
          <div key={p.name} className={`participant-card ${nicknames[p.name] ? 'active' : ''}`}>
            <div className="avatar-preview">
              <img src={getAvatarUrl(nicknames[p.name])} alt={p.name} />
            </div>
            <p className="impact-text">{p.name} ({p.age})</p>
            <input 
              type="text" 
              placeholder="Nickname" 
              value={nicknames[p.name] || ''}
              onChange={(e) => handleNicknameChange(p.name, e.target.value)}
              style={{ padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
              disabled={saving}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <div className="flex gap-1">
          {hasExisting && (
            <button onClick={handleUpdateOnly} disabled={saving} className="flex-1 flex items-center justify-center gap-1" style={{ background: 'var(--color-accent-blue)' }}>
              {saving ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />} 
              Actualitzar Noms
            </button>
          )}
          <button onClick={handleStartTournament} disabled={saving} className="flex-1 flex items-center justify-center gap-1">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {hasExisting ? 'Reiniciar i Regenerar' : 'Començar Torneig'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup;
