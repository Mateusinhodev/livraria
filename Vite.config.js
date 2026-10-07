import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Documentação: https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // mesma porta do Create React App
        open: true, // abre o navegador ao rodar "npm run dev"
    },
    build: {
        outDir: 'dist',
    },
});