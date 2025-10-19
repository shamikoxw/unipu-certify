<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">正在验证您的校友身份...</p>
      </div>

      <!-- 访问被拒绝 -->
      <div v-else-if="!hasAccess" class="text-center">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-red-500 text-6xl mb-4">🚫</div>
          <h1 class="text-2xl font-bold text-gray-800 mb-4">访问被拒绝</h1>
          <p class="text-gray-600 mb-6">此页面仅对持有 Token 认证证书的校友开放</p>
          <p class="text-sm text-gray-500 mb-6">
            您需要持有我校颁发的 Token 认证 NFT 才能访问校友门户
          </p>
          <router-link 
            to="/" 
            class="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            返回首页
          </router-link>
        </div>
      </div>

      <!-- 校友门户内容 -->
      <div v-else class="space-y-8">
        <!-- 欢迎横幅 -->
        <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-8 text-white">
          <h1 class="text-3xl font-bold mb-2">🎓 欢迎来到校友门户！</h1>
          <p class="text-lg">恭喜您成为我们的认证校友，享受专属权益</p>
        </div>

        <!-- 校友专属内容 -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 校友论坛 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-blue-500 text-4xl mb-4">💬</div>
            <h2 class="text-xl font-bold text-gray-800 mb-3">校友论坛</h2>
            <p class="text-gray-600 mb-4">与其他校友交流经验，分享职业发展心得</p>
            <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              进入论坛
            </button>
          </div>

          <!-- 独家招聘信息 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-green-500 text-4xl mb-4">💼</div>
            <h2 class="text-xl font-bold text-gray-800 mb-3">独家招聘信息</h2>
            <p class="text-gray-600 mb-4">获取校友企业提供的专属工作机会</p>
            <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              查看职位
            </button>
          </div>

          <!-- 校友活动 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-purple-500 text-4xl mb-4">🎉</div>
            <h2 class="text-xl font-bold text-gray-800 mb-3">校友活动</h2>
            <p class="text-gray-600 mb-4">参加校友聚会、讲座和社交活动</p>
            <button class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              查看活动
            </button>
          </div>

          <!-- 学习资源 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-orange-500 text-4xl mb-4">📚</div>
            <h2 class="text-xl font-bold text-gray-800 mb-3">学习资源</h2>
            <p class="text-gray-600 mb-4">访问校友专属的在线课程和资料库</p>
            <button class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              开始学习
            </button>
          </div>
        </div>

        <!-- NFT 证书信息 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">您的认证信息</h2>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-600 mb-2">钱包地址：{{ store.currentAccount }}</p>
            <p class="text-sm text-gray-600 mb-2">持有证书数量：{{ nftCount }} 个</p>
            <p class="text-sm text-gray-600">验证状态：✅ 已验证</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { store } from '../main'
import { getContract } from '../ethersService'

const loading = ref(true)
const hasAccess = ref(false)
const nftCount = ref(0)
const authorizedTokenFeatures = ref([])
const userNFTs = ref([])

const checkAlumniAccess = async () => {
  try {
    loading.value = true
    
    // 检查用户是否连接钱包
    if (!store.currentAccount) {
      hasAccess.value = false
      return
    }

    // 1. 加载授权特征列表
    await loadAuthorizedTokenFeatures()
    
    if (authorizedTokenFeatures.value.length === 0) {
      hasAccess.value = false
      return
    }

    // 2. 获取用户的所有 NFT
    await loadUserNFTs()
    
    // 3. 检查用户是否持有符合授权特征的 NFT
    let hasAuthorizedNFT = false
    let matchingNFTs = 0
    
    for (const userNFT of userNFTs.value) {
      for (const authorizedFeature of authorizedTokenFeatures.value) {
        if (checkNFTMatch(userNFT, authorizedFeature)) {
          hasAuthorizedNFT = true
          matchingNFTs++
          break
        }
      }
    }
    
    nftCount.value = matchingNFTs
    hasAccess.value = hasAuthorizedNFT
    
  } catch (error) {
    console.error('检查校友权限时出错:', error)
    hasAccess.value = false
  } finally {
    loading.value = false
  }
}

const loadAuthorizedTokenFeatures = async () => {
  try {
    const response = await fetch('/TokenNFT.json')
    const data = await response.json()
    authorizedTokenFeatures.value = data.authorizedTokenFeatures || []
    console.log('加载的授权特征列表:', authorizedTokenFeatures.value)
  } catch (error) {
    console.error('加载授权特征列表时出错:', error)
    authorizedTokenFeatures.value = []
  }
}

const loadUserNFTs = async () => {
  try {
    const { fetchMintedNFTsForUser } = await import('../ethersService')
    userNFTs.value = await fetchMintedNFTsForUser(store.currentAccount)
    console.log('用户持有的 NFT:', userNFTs.value)
  } catch (error) {
    console.error('加载用户 NFT 时出错:', error)
    userNFTs.value = []
  }
}

const checkNFTMatch = (userNFT, authorizedFeature) => {
  // 基于 NFT 的不可篡改特征进行匹配
  const matches = {
    certificateType: userNFT.certificateType === authorizedFeature.certificateType,
    universityName: userNFT.universityName === authorizedFeature.universityName,
    ipfsHash: userNFT.ipfsHash === authorizedFeature.ipfsHash,
    uri: userNFT.uri === authorizedFeature.uri
  }
  
  console.log('NFT 匹配检查:', {
    userNFT: userNFT,
    authorizedFeature: authorizedFeature,
    matches: matches
  })
  
  // 所有关键特征都必须匹配
  return matches.certificateType && matches.universityName && matches.ipfsHash
}

onMounted(() => {
  checkAlumniAccess()
})
</script>
