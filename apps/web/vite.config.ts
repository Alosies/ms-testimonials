import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueRouter from 'unplugin-vue-router/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/typed-router.d.ts',
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@testimonials/core': fileURLToPath(new URL('../../packages/libs/core/src', import.meta.url)),
      '@testimonials/ui': fileURLToPath(new URL('../../packages/libs/ui/src', import.meta.url)),
      '@testimonials/icons': fileURLToPath(new URL('../../packages/libs/icons/src', import.meta.url)),
      '@ui': fileURLToPath(new URL('../../packages/libs/ui/src', import.meta.url)),
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '3000', 10),
    open: true,
  },
});
