<template>
  <div
    v-if="!store.currentAccount"
    class="min-h-screen flex items-center justify-center bg-gray-100"
  >
    <div class="fixed inset-0 flex items-center justify-center">
      <button
        type="button"
        @click="openModal"
        class="rounded-md bg-black bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        连接钱包
      </button>
    </div>
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-100 p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900"
                >
                  连接钱包
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    请先连接钱包以查看文档。
                  </p>
                </div>

                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-sm text-white font-bold rounded-xl"
                    @click="handleConnectWallet"
                  >
                    连接
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>

  <div class="flex justify-center items-center">
    <Search @update:searchQuery="updateSearchQuery" />
  </div>

  <div class="flex flex-col p-6">
    <div class="hidden lg:flex mb-4">
      <a
        class="py-2 px-6 bg-yellow-500 hover:bg-yellow-600 text-sm text-white font-bold rounded-xl transition duration-200"
        :href="'https://sepolia.etherscan.io/address/' + store.currentAccount"
        target="_blank"
      >
        我的钱包（Etherscan）
      </a>
    </div>

    <div class="hidden lg:flex">
      <a
        class="py-2 px-6 bg-gray-500 hover:bg-gray-600 text-sm text-white font-bold rounded-xl transition duration-200"
        :href="store.smartContractAddress"
        target="_blank"
      >
        智能合约（Etherscan）
      </a>
    </div>

    <p v-if="store.isAdmin" class="mb-12">欢迎你，<b>管理员</b>！</p>

    <div class="my-6">
      <div class="flex flex-row">
        <Card v-for="nft in filteredNFTs" :key="nft.id" :nft="nft" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from "../components/Card.vue";
import Search from "../components/Search.vue";
import { ref, onMounted, computed, watch } from "vue";
import {
  initializeEthers,
  fetchAllMintedNFTs,
  connectWallet,
  getContract,
} from "../ethersService";
import { store } from "../main";

import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const isOpen = ref(true);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}

onMounted(async () => {
  await initializeEthers();
  store.uploadPage = false;
  store.myDocumentsPage = false;
  console.log("store.uploadPage", store.uploadPage);

  if (store.currentAccount) {
    store.certificates = await fetchAllMintedNFTs();
  }
});

watch(
  () => store.searchQuery,
  (newVal, oldVal) => {
    console.log("store.searchQuery changed:", newVal);
  }
);

const handleConnectWallet = async () => {
  try {
    const account = await connectWallet();
    console.log("Connected wallet:", account);
    store.currentAccount = account;

    const contractInstance = getContract();
    const adminAddress = await contractInstance.getAdmin();

    closeModal();
    store.certificates = await fetchAllMintedNFTs();

    if (account.toLowerCase() === adminAddress.toLowerCase()) {
      store.isAdmin = true;
    }
  } catch (error) {
    console.log("Error connecting wallet:", error);
  }
};

const selectedMenuItem = computed(() => store.selectedMenuItem);

const filteredNFTs = computed(() => {
  let nfts = store.certificates;

  if (store.searchQuery) {
    nfts = nfts.filter(
      (nft) =>
        nft.uri.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        nft.ownerAddress.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }
  console.log(nfts);

  if (selectedMenuItem.value && selectedMenuItem.value !== "全部") {
    nfts = nfts.filter((nft) => nft.certificateType === selectedMenuItem.value);
  }
  console.log(nfts);
  return nfts;
});

const updateSearchQuery = (newSearchQuery) => {
  console.log(newSearchQuery);
  store.searchQuery = newSearchQuery;
};
</script>
