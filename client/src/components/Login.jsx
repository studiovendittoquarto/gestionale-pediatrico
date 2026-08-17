import { useState } from 'react';
import { api, setToken } from '../api';

// Credenziali ricordate sul dispositivo (lo studio usa un accesso unico condiviso).
const K_USER = 'gp_user';
const K_PASS = 'gp_pass';
const K_REMEMBER = 'gp_remember';

export default function Login({ onLogin }) {
  // Di default ricordiamo: si riapre il gestionale senza riscrivere nulla.
  const [ricorda, setRicorda] = useState(() => localStorage.getItem(K_REMEMBER) !== '0');
  const [username, setUsername] = useState(() => localStorage.getItem(K_USER) || '');
  const [password, setPassword] = useState(() => localStorage.getItem(K_PASS) || '');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  function cambiaRicorda(attivo) {
    setRicorda(attivo);
    localStorage.setItem(K_REMEMBER, attivo ? '1' : '0');
    if (!attivo) {
      localStorage.removeItem(K_USER);
      localStorage.removeItem(K_PASS);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);
    try {
      const { token } = await api.login(username.trim(), password);
      setToken(token);
      if (ricorda) {
        localStorage.setItem(K_USER, username.trim());
        localStorage.setItem(K_PASS, password);
        localStorage.setItem(K_REMEMBER, '1');
      }
      onLogin();
    } catch (err) {
      setErrore(err.message);
    } finally {
      setCaricamento(false);
    }
  }

  // Se le credenziali sono già in memoria, il campo da mettere a fuoco è il bottone:
  // basta premere Invio per entrare.
  const precompilato = !!username && !!password;

  return (
    <div className="login-wrap">
      <form className="glass login-card" onSubmit={submit}>
        <div className="login-logo">🩺</div>
        <h1>Gestionale Pediatrico</h1>
        <p className="login-sub">Accedi per gestire gli appuntamenti</p>

        <label>Nome utente</label>
        <input
          autoFocus={!precompilato}
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome utente"
        />

        <label>Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <label className="login-ricorda">
          <input
            type="checkbox"
            checked={ricorda}
            onChange={(e) => cambiaRicorda(e.target.checked)}
          />
          <span>Ricorda le credenziali su questo dispositivo</span>
        </label>

        {errore && <div className="login-error">⚠️ {errore}</div>}

        <button className="btn-primary big" autoFocus={precompilato} disabled={caricamento}>
          {caricamento ? 'Accesso…' : 'Entra'}
        </button>
      </form>
    </div>
  );
}
