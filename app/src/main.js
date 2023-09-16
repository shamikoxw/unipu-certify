import { createApp, markRaw } from "vue";
import "./style.css";
import App from "./App.vue";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import router from "./router";

const pinia = createPinia();
/* Init Pinia Persisted state plugin */
pinia.use(piniaPluginPersistedstate);
pinia.use(({ store }) => {
  store.router = markRaw(router);
});

const app = createApp(App);
app.use(pinia);

app.use(router);

app.mount("#app");
