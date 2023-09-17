import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    router: null,
    uploadPage: false,
    currentAccount: null,
    isAdmin: false,
    txHashes: {},
    selectedMenuItem: "Sve",
    searchQuery: "",
  }),
  getters: {
    getRouter() {
      return this.router;
    },
    getTxHash(ipfsHash) {
      return this.txHashes[ipfsHash];
    },
    getSelectedMenuItem() {
      return this.selectedMenuItem;
    },
    getSearchQuery() {
      return this.searchQuery;
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
    setTxHash(ipfsHash, txHash) {
      this.txHashes[ipfsHash] = txHash;
    },
    setSelectedMenuItem(item) {
      this.selectedMenuItem = item;
    },
    setSearchQuery(query) {
      this.searchQuery = query;
    },
  },
  persist: true,
});
