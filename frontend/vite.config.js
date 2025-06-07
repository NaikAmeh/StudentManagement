import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: [/src\/.*\.(js|jsx)$/],
    exclude: [],
  },
  server: {
    port: 5173,
    host: true, // Allow access from the Codespace URL
  },
});