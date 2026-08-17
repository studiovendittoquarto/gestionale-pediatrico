import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { migraIntervalloDefault } from './helpers';
import './styles.css';

// Porta i dispositivi già in uso al nuovo default di 10 minuti (una sola volta)
migraIntervalloDefault();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
