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
          <b>Izdao:</b> {{ nft.universityName }}
        </div>
        <p class="text-gray-700 text-base">
          {{ nft.certificateType }}
        </p>
        <p class="text-gray-700 text-base">
          {{ nft.certificateDate }}
        </p>
      </div>
      <div class="flex items-center">
        <div class="text-sm">
          <p class="text-gray-900 leading-none">
            Vlasnik: {{ nft.ownerAddress }}
          </p>
          <p class="text-gray-600">URI: {{ nft.uri }}</p>

          <a
            class="text-gray-600"
            target="_blank="
            :href="'https://ipfs.io/ipfs/' + nft.ipfsHash"
          >
            NFT: {{ "https://ipfs.io/ipfs/" + nft.ipfsHash }}
          </a>
        </div>
      </div>
      <button @click="verifyCertificate(nft.id)" class="btn btn-verify">
        Validiraj
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { verifyCertificateOnChain } from "../ethersService";

const props = defineProps({
  nft: {
    type: Object,
    required: true,
  },
});
const nft = ref(props.nft);
console.log(nft);

async function verifyCertificate(tokenId) {
  const uiDetails = {
    uri: nft.value.uri,
    ipfsHash: nft.value.ipfsHash,
    universityName: nft.value.universityName,
    certificateType: nft.value.certificateType,
    certificateDate: nft.value.certificateDate,
  };
  const isValid = await verifyCertificateOnChain(tokenId, uiDetails);
  if (isValid) {
    alert("Dokument je validan.");
  } else {
    alert("Dokument nije validan!");
  }
}
</script>
