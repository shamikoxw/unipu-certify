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
                    请先连接钱包以进入My Certify。
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

    <p v-if="store.isAdmin" class="mb-12"><div style="text-align: center;">欢迎你，<b>管理员</b>！</div></p>

    <div class="my-6">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <p class="mt-4 text-gray-600 text-sm">加载中……</p>
      </div>

      <template v-else>
      <!-- 搜索与分页设置（同一行，左上角） -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索：URI / 日期 / 颁发机构 / 名称"
            class="border rounded px-3 py-1 text-sm w-72"
          />
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">每页</label>
            <select v-model.number="pageSize" class="border rounded px-2 py-1 text-sm">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
          </div>
        </div>
        <span class="text-sm text-gray-500">共 {{ filteredNFTs.length }} 条</span>
      </div>

      <!-- 三列网格展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="nft in visibleNFTs" :key="nft.id" :nft="nft" />
      </div>

      <!-- 分页器 -->
      <div class="mt-6 flex items-center justify-center space-x-2">
        <button
          class="px-3 py-1 rounded border text-sm disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >上一页</button>

        <button
          v-for="p in pageButtons"
          :key="p"
          class="px-3 py-1 rounded border text-sm"
          :class="p === currentPage ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white'"
          @click="currentPage = p"
        >{{ p }}</button>

        <button
          class="px-3 py-1 rounded border text-sm disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
        >下一页</button>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import Card from "../components/Card.vue";
import { ref, onMounted, computed, watch } from "vue";
import {
  initializeEthers,
  fetchAllMintedNFTs,
  fetchMintedNFTsForUser,
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
const isLoading = ref(true);

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

  // 默认不展示任何NFT，直到确认钱包与权限
  if (!store.currentAccount) {
    store.certificates = [];
    store.isAdmin = false;
    isLoading.value = false;
    return;
  }

  try {
    const contractInstance = getContract();
    const adminAddress = await contractInstance.getAdmin();
    store.isAdmin = store.currentAccount.toLowerCase() === adminAddress.toLowerCase();
    store.certificates = store.isAdmin
      ? await fetchAllMintedNFTs()
      : await fetchMintedNFTsForUser(store.currentAccount);
  } catch (e) {
    console.error("初始化证书列表失败:", e);
    store.certificates = [];
  } finally {
    isLoading.value = false;
  }
});

//

const handleConnectWallet = async () => {
  try {
    const account = await connectWallet();
    console.log("Connected wallet:", account);
    store.currentAccount = account;

    const contractInstance = getContract();
    const adminAddress = await contractInstance.getAdmin();

    closeModal();
  // 根据是否管理员决定拉取数据范围
  isLoading.value = true;
  store.isAdmin = account.toLowerCase() === adminAddress.toLowerCase();
  store.certificates = store.isAdmin
    ? await fetchAllMintedNFTs()
    : await fetchMintedNFTsForUser(account);
  isLoading.value = false;

    if (account.toLowerCase() === adminAddress.toLowerCase()) {
      store.isAdmin = true;
    }
  } catch (error) {
    console.log("Error connecting wallet:", error);
  }
};

const selectedMenuItem = computed(() => store.selectedMenuItem);

const searchQuery = ref("");

const filteredNFTs = computed(() => {
  let nfts = store.certificates;

  const q = (searchQuery.value || "").toLowerCase();
  if (q) {
    nfts = nfts.filter((nft) => {
      const uri = (nft.uri || "").toLowerCase();
      const date = (nft.certificateDate || "").toLowerCase();
      const uni = (nft.universityName || "").toLowerCase();
      const name = (nft.certificateType || "").toLowerCase();
      return uri.includes(q) || date.includes(q) || uni.includes(q) || name.includes(q);
    });
  }

  if (selectedMenuItem.value && selectedMenuItem.value !== "全部") {
    nfts = nfts.filter((nft) => nft.certificateType === selectedMenuItem.value);
  }
  return nfts;
});

const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredNFTs.value.length / pageSize.value));
});
const visibleNFTs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredNFTs.value.slice(start, end);
});
const pageButtons = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  return pages;
});

watch([filteredNFTs, pageSize], () => {
  currentPage.value = 1;
});

//
</script>
