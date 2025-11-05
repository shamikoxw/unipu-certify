<template>
  <div v-if="nft && nft.uri" class="w-full">
    <div class="bg-white rounded-lg border border-gray-200 p-4 flex flex-col space-y-3">
      <div class="text-gray-900 text-lg">
        <b>颁发机构：</b> {{ nft.universityName }}
      </div>
      <div class="text-gray-700">{{ nft.certificateType }}</div>
      <div class="text-gray-700">{{ nft.certificateDate }}</div>

      <div class="text-sm">
        <div class="flex items-center mb-1">
          <span>👤</span>
          <p class="text-gray-900 leading-none ml-2">所有者：{{ nft.ownerAddress }}</p>
        </div>
        <div class="flex items-center mb-1">
          <span>🔗</span>
          <p class="text-gray-600 ml-2 break-all">URI: {{ nft.uri }}</p>
        </div>
        <div class="flex items-center truncate-container">
          <span>🎓</span>
          <a
            class="text-blue-600 ml-2 underline truncate"
            target="_blank"
            :href="'https://ipfs.io/ipfs/' + nft.ipfsHash"
            :title="'https://ipfs.io/ipfs/' + nft.ipfsHash"
          >
            查看证书文件
          </a>
        </div>
      </div>

      <div class="pt-2">
        <button @click="verifyCertificate(nft.id)" class="py-2 px-4 bg-green-500 hover:bg-green-600 text-sm text-white font-bold rounded-md transition duration-200">
          验证
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { verifyCertificateOnChain, getOwnerAddress } from "../ethersService";

const props = defineProps({
  nft: {
    type: Object,
    required: true,
  },
});
const nft = ref({
  ...props.nft,
  ownerAddress: "",
});
console.log(nft);

async function verifyCertificate(tokenId) {
  const uiDetails = {
    uri: nft.value.uri,
    ipfsHash: nft.value.ipfsHash,
    universityName: nft.value.universityName,
    certificateType: nft.value.certificateType,
    certificateDate: nft.value.certificateDate,
  };
  const ownerAddress = await getOwnerAddress(tokenId);

  nft.value.ownerAddress = ownerAddress;
  const isValid = await verifyCertificateOnChain(tokenId, uiDetails);
  if (isValid) {
    alert("文档有效。");
  } else {
    alert("文档无效！");
  }
}
</script>
<style>
.truncate-container {
  max-width: 100%;
  display: flex;
  align-items: center;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}
</style>
