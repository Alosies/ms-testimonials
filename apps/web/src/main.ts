import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';

import App from './App.vue';
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
app.use(router);

app.mount('#app');
