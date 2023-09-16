<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="p-8 bg-white rounded shadow-lg">
      <button
        v-if="!currentAccount"
        @click="handleConnectWallet"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Connect wallet
      </button>
      <div v-if="currentAccount" class="text-gray-700">
        Current Account:
        <span class="font-medium text-gray-900">{{ currentAccount }}</span>
      </div>
      <div v-if="isAdmin" class="text-gray-700 mt-2">
        Welcome back, <b>admin!</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { initializeEthers, connectWallet, getContract } from "../ethersService";

const isAdmin = ref(false);
const currentAccount = ref(null);

// Initialize ethers when the component is mounted
onMounted(() => {
  initializeEthers();
});

const handleConnectWallet = async () => {
  try {
    const account = await connectWallet();
    console.log("Connected wallet:", account);
    currentAccount.value = account;

    const contractInstance = getContract(); // Get the contract
    const adminAddress = await contractInstance.admin(); // Assuming admin is a public variable in your contract

    if (account.toLowerCase() === adminAddress.toLowerCase()) {
      isAdmin.value = true;
    }
  } catch (error) {
    console.log("Error connecting wallet:", error);
  }
};
</script>
