import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleContact } from './contact.mjs';

export default defineConfig({
  plugins: [react(), {
    name: 'zuun-contact',
    configureServer(server) { server.middlewares.use('/api/contact', handleContact); },
  }],
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app'] },
});
