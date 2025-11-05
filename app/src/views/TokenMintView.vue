<template>
  <div class="flex items-center justify-center p-12">
    <div class="mx-auto w-full max-w-[550px] bg-white">
      <form @submit.prevent="mintTokenNFT" class="py-6 px-9" method="POST">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Token 证书颁发</h2>
          <p class="text-gray-600">向指定钱包地址颁发 Token 认证 NFT</p>
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

        <div class="mb-5">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            文档类型
          </label>
          <div class="w-full rounded-md border border-[#e0e0e0] bg-gray-100 py-3 px-6 text-base font-medium text-[#6B7280]">
            Token认证
          </div>
          <p class="text-sm text-gray-500 mt-1">Token 认证类型固定，无需选择</p>
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium leading-6 text-gray-900">
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
        </div>

        <!-- 提示信息 -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex">
            <div class="text-blue-500 text-xl mr-3">ℹ️</div>
            <div>
              <h3 class="text-sm font-medium text-blue-800">Token 认证说明</h3>
              <p class="text-sm text-blue-700 mt-1">
                此功能将铸造一个特殊的 Token 认证 NFT，持有者将获得访问校友门户的权限。
                无需上传文件，系统将自动生成 Token 认证证书。
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            @click="mintTokenNFT"
            type="button"
            :disabled="isMinting"
            class="hover:shadow-form w-full rounded-md bg-yellow-500 py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isMinting ? '正在铸造...' : '颁发 Token 认证' }}
          </button>
        </div>

        <!-- 成功提示 -->
        <div v-if="mintSuccess" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex">
            <div class="text-green-500 text-xl mr-3">✅</div>
            <div>
              <h3 class="text-sm font-medium text-green-800">Token 认证颁发成功！</h3>
              <p class="text-sm text-green-700 mt-1">
                Token ID: {{ mintedTokenId }}<br>
                交易哈希: {{ txHash }}
              </p>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <div class="text-red-500 text-xl mr-3">❌</div>
            <div>
              <h3 class="text-sm font-medium text-red-800">颁发失败</h3>
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
import { store } from "../main";
import { callContractFunction, getContract } from "../ethersService";

onMounted(() => {
  console.log("TokenMintView mounted");
  store.tokenMintPage = true;
});

onUnmounted(() => {
  console.log("TokenMintView unmounted");
  store.tokenMintPage = false;
});

const today = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const walletAddress = ref("");
const universityName = ref("");
const certificateDate = ref("");
const isMinting = ref(false);
const mintSuccess = ref(false);
const mintedTokenId = ref("");
const txHash = ref("");
const errorMessage = ref("");

const mintTokenNFT = async () => {
  try {
    isMinting.value = true;
    errorMessage.value = "";
    mintSuccess.value = false;

    // 验证输入
    if (!walletAddress.value || !universityName.value || !certificateDate.value) {
      errorMessage.value = "请填写所有必填字段";
      return;
    }

    // 验证钱包地址格式
    if (!walletAddress.value.startsWith('0x') || walletAddress.value.length !== 42) {
      errorMessage.value = "请输入有效的钱包地址";
      return;
    }

    // 生成随机 URI（用于 Token 认证）
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const uri = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 生成 Token 认证的 IPFS Hash（使用固定内容）
    const tokenMetadata = {
      name: "Token认证",
      description: `由 ${universityName.value} 颁发的 Token 认证证书`,
      image: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Token+Certification",
      attributes: [
        {
          trait_type: "证书类型",
          value: "Token认证"
        },
        {
          trait_type: "颁发机构",
          value: universityName.value
        },
        {
          trait_type: "颁发日期",
          value: certificateDate.value
        }
      ]
    };

    // 这里我们使用一个固定的 IPFS Hash，因为不需要上传文件
    // 在实际应用中，您可能需要将 metadata 上传到 IPFS
    const ipfsHash = "QmTokenCertification" + Date.now();

    console.log("开始铸造 Token 认证 NFT...");
    console.log("钱包地址:", walletAddress.value);
    console.log("颁发机构:", universityName.value);
    console.log("颁发日期:", certificateDate.value);

    const { transactionResponse, txHash: transactionHash } = await callContractFunction(
      "mint",
      walletAddress.value,
      uri,
      ipfsHash,
      universityName.value,
      "Token认证",
      certificateDate.value
    );

    if (transactionResponse) {
      // 获取铸造的 Token ID
      const contract = getContract();
      const totalCertificates = await contract.totalCertificates();
      const tokenId = totalCertificates.toNumber() - 1; // 最新铸造的 Token ID

      mintedTokenId.value = tokenId;
      txHash.value = transactionHash;
      mintSuccess.value = true;

      // 自动更新 TokenNFT.json 文件
      console.log("Token 认证 NFT 铸造成功！");
      console.log("Token ID:", tokenId);
      console.log("交易哈希:", transactionHash);
      
      // 自动将 Token ID 添加到授权列表
      try {
        await updateTokenNFTJson(tokenId);
        alert(`🎉 Token 认证颁发成功！\n\nToken ID: ${tokenId}\n\n✅ 已自动添加到授权列表，用户现在可以访问校友门户。`);
      } catch (updateError) {
        console.error("添加到授权列表失败:", updateError);
        alert(`🎉 Token 认证 NFT 铸造成功！\n\nToken ID: ${tokenId}\n\n⚠️ 但添加到授权列表失败: ${updateError.message}\n\n请手动将 Token ID ${tokenId} 添加到授权列表。`);
      }

      // 清空表单
      walletAddress.value = "";
      universityName.value = "";
      certificateDate.value = "";
    }

  } catch (error) {
    console.error("铸造 Token 认证 NFT 时出错:", error);
    errorMessage.value = error.message || "铸造失败，请重试";
  } finally {
    isMinting.value = false;
  }
};

// 将 Token 添加到后端授权列表
const updateTokenNFTJson = async (tokenId) => {
  try {
    // 获取刚铸造的 NFT 的完整特征
    const contract = getContract();
    const certificate = await contract.certificates(tokenId);
    
    const nftFeatures = {
      tokenId: tokenId,
      certificateType: certificate.certificateType,
      universityName: certificate.universityName,
      ipfsHash: certificate.ipfsHash,
      uri: certificate.uri,
      certificateDate: certificate.certificateDate,
      walletAddress: walletAddress.value // 添加钱包地址
    };
    
    console.log('NFT 特征:', nftFeatures);
    
    // 调用后端 API 添加 Token
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/token-nft/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenFeatures: nftFeatures
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.message || errorData.error || '添加Token失败');
    }

    const result = await response.json();
    console.log('Token NFT 特征更新成功:', result.message);
    return true;
  } catch (error) {
    console.error("添加到授权列表时出错:", error);
    throw error; // 抛出错误，让调用者处理
  }
};
</script>
