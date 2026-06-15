import { useState } from 'react';
import { api, setToken } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);
    try {
      const { token } = await api.login(username.trim(), password);
      setToken(token);
      onLogin();
    } catch (err) {
      setErrore(err.message);
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="glass login-card" onSubmit={submit}>
        <div className="login-logo">🩺</div>
        <h1>Gestionale Pediatrico</h1>
        <p className="login-sub">Accedi per gestire gli appuntamenti</p>

        <label>Nome utente</label>
        <input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome utente"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {errore && <div className="login-error">⚠️ {errore}</div>}

        <button className="btn-primary big" disabled={caricamento}>
          {caricamento ? 'Accesso…' : 'Entra'}
        </button>
      </form>
    </div>
  );
}
