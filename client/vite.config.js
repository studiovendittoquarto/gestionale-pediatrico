import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In sviluppo locale inoltra /api e /socket.io al backend su porta 3000.
// In produzione frontend e backend sono sullo stesso dominio, quindi non serve.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
});
