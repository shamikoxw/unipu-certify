import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    router: null,
    uploadPage: false,
    currentAccount: null,
    isAdmin: false,
  }),
  getters: {
    getRouter() {
      return this.router;
    },
  },
  actions: {
    setRouter(router) {
      this.router = router;
    },
    disconnect() {
      this.currentAccount = null;
      this.isAdmin = false;
    },
  },
  persist: true,
});
