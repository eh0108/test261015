import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/test261015/',
  plugins: [react()],
  test: { environment: 'node' },
});
