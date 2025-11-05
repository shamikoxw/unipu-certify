<template>
  <div class="flex items-center justify-center p-12">
    <div class="mx-auto w-full max-w-[550px] bg-white">
      <form @submit.prevent="uploadFile" class="py-6 px-9" method="POST">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">上传证书并铸造 NFT</h2>
          <p class="text-gray-600">上传 PDF 文档，选择文档类型并铸造链上学术证书 NFT</p>
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            接收证书的钱包地址
          </label>
          <input
            name="walletAddress"
            v-model="walletAddress"
            placeholder="0x..."
            class="w-full rounded-md border border-[#e0e0e0] bg-white py-1 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-yellow-500 focus:shadow-md"
            required
          />
        </div>
        <div class="mb-5">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            颁发机构
          </label>
          <input
            name="universityName"
            v-model="universityName"
            placeholder="请输入颁发机构名称"
            class="w-full rounded-md border border-[#e0e0e0] bg-white py-1 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-yellow-500 focus:shadow-md"
            required
          />
        </div>

        <Listbox as="div" v-model="selected">
          <ListboxLabel
            class="block text-sm font-medium leading-6 text-gray-900"
            >文档类型</ListboxLabel
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
          颁发日期
        </label>
        <input
          type="date"
          v-model="certificateDate"
          id="certificateDate"
          name="certificateDate"
          min="2018-01-01"
          :max="today"
          class="w-full rounded-md border border-[#e0e0e0] bg-white py-1 pl-6 pr-2 text-base outline-none focus:border-yellow-500 focus:shadow-md"
          required
        />

        <div class="mb-6 pt-4">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            上传文档
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
                  拖拽到此处
                </span>
                <span class="mb-2 block text-base font-medium text-[#6B7280]">
                  或者
                </span>
                <span
                  class="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]"
                >
                  浏览
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
            :disabled="isUploading"
            class="hover:shadow-form w-full rounded-md bg-yellow-500 py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isUploading ? '正在上传并铸造...' : '提交并铸造 NFT' }}
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <div class="text-red-500 text-xl mr-3">❌</div>
            <div>
              <h3 class="text-sm font-medium text-red-800">提交失败</h3>
              <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
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

onUnmounted(() => {
  store.uploadPage = false;
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
const walletAddress = ref("");
const universityName = ref("");
const certificateDate = ref("");
const isUploading = ref(false);
const errorMessage = ref("");

const uploadFile = async () => {
  try {
    isUploading.value = true;
    errorMessage.value = "";

    // 基本校验
    if (!walletAddress.value || !universityName.value || !certificateDate.value) {
      errorMessage.value = "请填写所有必填字段";
      return;
    }
    if (!walletAddress.value.startsWith('0x') || walletAddress.value.length !== 42) {
      errorMessage.value = "请输入有效的钱包地址";
      return;
    }
    if (!selected.value || !selected.value.name) {
      errorMessage.value = "请选择文档类型";
      return;
    }
    if (!fileInput.value || !fileInput.value.files || !fileInput.value.files[0]) {
      errorMessage.value = "请上传证书 PDF 文档";
      return;
    }

    const file = fileInput.value.files[0];
    const metadata = { name: "Certificate PDF" };
    const ipfsHash = await pinFileToIPFS(file, metadata);
    if (!ipfsHash) {
      errorMessage.value = "上传到 IPFS 失败，请重试";
      return;
    }

    // 生成随机 URI
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const uri = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const actualWalletAddress = walletAddress.value;
    const actualUniversityName = universityName.value;
    const actualCertificateType = selected.value.name;
    const actualCertificateDate = certificateDate.value;

    const { transactionResponse, txHash: transactionHash } = await callContractFunction(
      "mint",
      actualWalletAddress,
      uri,
      ipfsHash,
      actualUniversityName,
      actualCertificateType,
      actualCertificateDate
    );

    if (transactionResponse) {
      if (transactionHash) {
        console.log("Transaction hash:", transactionHash);
        // 保留链上记录映射，不展示 Token ID
        store.setTxHash(ipfsHash, transactionHash);
      }
      alert('✅ 上传并铸造成功！');

      // 清空表单
      walletAddress.value = "";
      universityName.value = "";
      certificateDate.value = "";
      uploadedFileName.value = "";
      if (fileInput.value) fileInput.value.value = "";
    }
  } catch (error) {
    console.error("上传或铸造过程中出错:", error);
    errorMessage.value = error.message || "提交失败，请重试";
  } finally {
    isUploading.value = false;
  }
};

const certificatesTypes = [
  { id: 1, name: "毕业论文" },
  { id: 2, name: "硕士论文" },
  { id: 3, name: "学士学位证书" },
];

const selected = ref(certificatesTypes[0]);
 
</script>
