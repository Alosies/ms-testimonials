import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';

import App from './App.vue';
import { setupAuthGuards } from './app/router/guards';
import './index.css';

const app = createApp(App);

// Pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Setup auth guards
setupAuthGuards(router);

app.use(router);

app.mount('#app');
