import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  // esbuild: {
  //   loader: 'jsx',
  //   include: /.*\.js$/, ///(js|jsx)$/, // match both .js and .jsx files
  // },
});
//VITE_API_BASE_URL=https://localhost:7145
