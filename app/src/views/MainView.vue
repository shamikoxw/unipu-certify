<template>
  <div
    v-if="!store.currentAccount"
    class="min-h-screen flex items-center justify-center bg-gray-100"
  >
    <div class="fixed inset-0 flex items-center justify-center">
      <button
        type="button"
        @click="openModal"
        class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Poveži novčanik
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
                  Poveži novčanik
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Poveži novčanik kako bi mogao pregledati dokumente.
                  </p>
                </div>

                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-sm text-white font-bold rounded-xl"
                    @click="handleConnectWallet"
                  >
                    Poveži
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
    <p><b>Povezani novčanik:</b> {{ store.currentAccount }}</p>
    <p v-if="store.isAdmin" class="mb-12">Dobro došli, <b>admin</b>!</p>

    <Card></Card>
  </div>
</template>

<script setup>
import Card from "../components/Card.vue";
import { ref, onMounted, computed } from "vue";
import { initializeEthers, connectWallet, getContract } from "../ethersService";
import { pinFileToIPFS } from "../pinataService";
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

// Initialize ethers when the component is mounted
onMounted(() => {
  initializeEthers();
  store.uploadPage = false;
  console.log("store.uploadPage", store.uploadPage);
});

const handleConnectWallet = async () => {
  try {
    const account = await connectWallet();
    console.log("Connected wallet:", account);
    store.currentAccount = account;

    const contractInstance = getContract(); // Get the contract
    const adminAddress = await contractInstance.admin(); // Assuming admin is a public variable in your contract
    closeModal();
    if (account.toLowerCase() === adminAddress.toLowerCase()) {
      store.isAdmin = true;
    }
  } catch (error) {
    console.log("Error connecting wallet:", error);
  }
};
</script>
