<template>
  <div class="my-6">
    <div class="flex flex-col md:flex-row">
      <Card v-for="nft in filteredNFTs" :key="nft.id" :nft="nft" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Card from "../components/Card.vue";
import { store } from "../main";
import { fetchMintedNFTsForUser } from "../ethersService";

onMounted(async () => {
  store.myDocumentsPage = true;
  store.myCertificates = await fetchMintedNFTsForUser(store.currentAccount);
});

const selectedMenuItem = computed(() => store.selectedMenuItem);

const filteredNFTs = computed(() => {
  let nfts = store.myCertificates;

  if (store.searchQuery) {
    nfts = nfts.filter(
      (nft) =>
        nft.uri.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        nft.ownerAddress.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }
  console.log(nfts);

  if (selectedMenuItem.value && selectedMenuItem.value !== "Sve") {
    nfts = nfts.filter((nft) => nft.certificateType === selectedMenuItem.value);
  }
  console.log(nfts);
  return nfts;
});
</script>
