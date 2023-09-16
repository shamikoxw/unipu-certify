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
import { connectWallet, callContractFunction } from "../ethersService";
import { uploadToIPFS } from "../ipfsService";

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

async function mintCertificate(file, to, universityName, certificateDate) {
  // Step 1: Upload PDF to IPFS
  const ipfsHash = await uploadToIPFS(file);
  const uri = `ipfs://${ipfsHash}`;

  // Step 2: Mint a new NFT with the IPFS hash
  await callContractFunction("mint", to, uri, universityName, certificateDate);
}
</script>
