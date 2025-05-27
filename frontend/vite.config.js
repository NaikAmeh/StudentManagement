import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   esbuild: {
//     loader: 'jsx',
//     include: /.*\.js$/,
//   }
// })


export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    // include: [
    //   // Ensure these paths cover all files potentially using JSX
    //   'src/**/*.js',
    //   'src/**/*.jsx',
    //   // Add .ts/.tsx if using TypeScript
    // ],
    include: [/src\/.*\.(js|jsx)$/],
    exclude: [],
  },
  server: {
    port: 3000,
  },
  define: {
    'process.env': process.env, // Make environment variables accessible
  },
});
//VITE_API_BASE_URL=https://localhost:7145
