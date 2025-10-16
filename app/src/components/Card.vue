<template>
  <div v-if="nft && nft.uri" class="max-w-sm w-full lg:max-w-full lg:flex">
    <div
      class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
      title="NFT Image"
    ></div>

    <div
      class="bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal"
    >
      <div class="mb-8">
        <iframe
          :src="'https://ipfs.io/ipfs/' + nft.ipfsHash"
          width="400"
          height="500"
        ></iframe>

        <div class="text-gray-900 text-xl mb-2">
          <b>颁发机构：</b> {{ nft.universityName }}
        </div>
        <p class="text-gray-700 text-base">
          {{ nft.certificateType }}
        </p>
        <p class="text-gray-700 text-base">
          {{ nft.certificateDate }}
        </p>
      </div>

      <div class="flex items-center">
        <div class="text-sm flex-grow">
          <div class="flex items-center">
            <span class="icon-class-or-emoji">👤</span>
            <p class="text-gray-900 leading-none ml-2">
              所有者：{{ nft.ownerAddress }}
            </p>
          </div>
          <div class="flex items-center">
            <span class="icon-class-or-emoji">🔗</span>
            <p class="text-gray-600 ml-2">URI: {{ nft.uri }}</p>
          </div>
          <div class="flex items-center truncate-container">
            <span class="icon-class-or-emoji">🎓</span>
            <a
              class="text-gray-600 ml-2 truncate"
              target="_blank"
              :href="'https://ipfs.io/ipfs/' + nft.ipfsHash"
              title="{{ 'https://ipfs.io/ipfs/' + nft.ipfsHash }}"
            >
              NFT：
              <a
                class="underline"
                :href="'https://ipfs.io/ipfs/' + nft.ipfsHash"
                >link</a
              >
            </a>
          </div>
        </div>
      </div>
      <button @click="verifyCertificate(nft.id)" class="btn btn-verify">
        验证
      </button>
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
