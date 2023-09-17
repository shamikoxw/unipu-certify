<template>
  <div class="flex items-center justify-center p-12">
    <div class="mx-auto w-full max-w-[550px] bg-white">
      <form @submit.prevent="uploadFile" class="py-6 px-9" method="POST">
        <div class="mb-5">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            Institucija koja je izdala dokument
          </label>
          <input
            name="universityName"
            v-model="universityName"
            class="w-full rounded-md border border-[#e0e0e0] bg-white py-1 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-yellow-500 focus:shadow-md"
          />
        </div>

        <Listbox as="div" v-model="certificateType">
          <ListboxLabel
            class="block text-sm font-medium leading-6 text-gray-900"
            >Vrsta dokumenta</ListboxLabel
          >
          <div class="relative mt-2">
            <ListboxButton
              class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <span class="flex items-center">
                <span class="ml-3 block truncate">{{ selected.name }}</span>
              </span>
              <span
                class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
              >
                <ChevronUpDownIcon
                  class="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                <ListboxOption
                  as="template"
                  v-for="c in certificatesTypes"
                  :key="c.id"
                  :value="c"
                  v-slot="{ active, selected }"
                >
                  <li
                    :class="[
                      active ? 'bg-yellow-600 text-white' : 'text-gray-900',
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                    ]"
                  >
                    <div class="flex items-center">
                      <span
                        :class="[
                          selected ? 'font-semibold' : 'font-normal',
                          'ml-3 block truncate',
                        ]"
                        >{{ c.name }}</span
                      >
                    </div>

                    <span
                      v-if="selected"
                      :class="[
                        active ? 'text-white' : 'text-yellow-600',
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                      ]"
                    >
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>

        <label class="mt-4 block text-sm font-medium leading-6 text-gray-900">
          Datum izdavanja
        </label>
        <input
          type="date"
          v-model="certificateDate"
          id="start"
          name="trip-start"
          min="2018-01-01"
          :max="today"
          class="w-full rounded-md border border-[#e0e0e0] bg-white py-1 pl-6 pr-2 text-base outline-none focus:border-yellow-500 focus:shadow-md"
        />

        <div class="mb-6 pt-4">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            Učitaj dokument
          </label>

          <div class="mb-8">
            <input
              type="file"
              name="file"
              id="file"
              class="sr-only"
              @click="setRef"
              @change="uploadedFileName = $event.target.files[0]?.name || ''"
            />

            <label
              for="file"
              class="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center"
            >
              <div>
                <span class="mb-2 block text-xl font-semibold text-[#07074D]">
                  Povuci ovdje
                </span>
                <span class="mb-2 block text-base font-medium text-[#6B7280]">
                  ili
                </span>
                <span
                  class="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]"
                >
                  Pretraži
                </span>
                <span
                  v-if="uploadedFileName"
                  class="block text-sm text-gray-600"
                >
                  {{ uploadedFileName }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <button
            @click="uploadFile"
            type="button"
            class="hover:shadow-form w-full rounded-md bg-yellow-500 py-3 px-8 text-center text-base font-semibold text-white outline-none"
          >
            Dodaj
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { store } from "../main";
import { pinFileToIPFS } from "../pinataService";
import { callContractFunction } from "../ethersService";
const setRef = () => {
  fileInput.value = document.getElementById("file");
};

onMounted(() => {
  console.log("mounted");
  store.uploadPage = true;
});

const today = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const uploadedFileName = ref("");
const fileInput = ref(null);

const universityName = ref("");
const certificateType = ref("");
const certificateDate = ref("");

const uploadFile = async () => {
  try {
    const currentAccount = store.currentAccount;

    if (fileInput.value) {
      const file = fileInput.value.files[0];
      if (file) {
        const metadata = { name: "Your metadata here" };
        const ipfsHash = await pinFileToIPFS(file, metadata);

        if (ipfsHash) {
          const array = new Uint8Array(16);
          window.crypto.getRandomValues(array);
          const uri = Array.from(array)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          const actualUniversityName = universityName.value;
          const actualCertificateType = certificateType.value.name;
          const actualCertificateDate = certificateDate.value;

          const { transactionResponse, txHash } = await callContractFunction(
            "mint",
            currentAccount,
            uri,
            ipfsHash,
            actualUniversityName,
            actualCertificateType,
            actualCertificateDate
          );

          if (txHash) {
            console.log("Transaction hash:", txHash);
            store.setTxHash(ipfsHash, txHash);
          }

          if (transactionResponse) {
            console.log("Transaction Response:", transactionResponse);
          }

          if (txHash) {
            console.log("Transaction hash:", txHash);
            store.setTxHash(ipfsHash, txHash);
          }
          console.log("NFT minted successfully");
        }
      }
    }
  } catch (error) {
    console.error("An error occurred while uploading the file:", error);
  }
};

const certificatesTypes = [
  {
    id: 1,
    name: "Završni radovi",
  },
  {
    id: 2,
    name: "Diplomski radovi",
  },
  {
    id: 3,
    name: "Diplome (preddiplomski)",
  },
  {
    id: 4,
    name: "Diplome (diplomski)",
  },
];

const selected = ref(certificatesTypes[0]);
</script>
