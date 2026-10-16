import { defineConfig } from 'vite';
export default defineConfig({
  define: { global: 'globalThis' },
  build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
});
