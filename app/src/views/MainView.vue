<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="p-8 bg-white rounded shadow-lg">
      <button
        @click="handleConnectWallet"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Connect wallet
      </button>
      <div v-if="currentAccount" class="text-gray-700">
        Current Account:
        <span class="font-medium text-gray-900">{{ currentAccount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { connectWallet } from "../ethersService";

const currentAccount = ref(null);

const handleConnectWallet = async () => {
  try {
    const account = await connectWallet();
    console.log("Connected wallet:", account);
    currentAccount.value = account;
  } catch (error) {
    console.log("Error connecting wallet:", error);
  }
};
</script>
