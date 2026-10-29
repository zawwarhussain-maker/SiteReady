import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        '**/mobile/**',
        '**/.dart_tool/**',
        '**/prototype_v1/**',
        '**/stitch_site_ready/**',
        '**/supabase/**',
        '**/dist/**',
        '**/.git/**',
        '**/node_modules/**'
      ]
    }
  }
});
