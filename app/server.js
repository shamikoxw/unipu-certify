const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// TokenNFT.json 文件路径
const TOKEN_NFT_FILE = path.join(__dirname, 'TokenNFT.json');

// 读取 TokenNFT.json 文件
async function readTokenNFTFile() {
  try {
    const data = await fs.readFile(TOKEN_NFT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，返回默认结构
    return {
      description: "有权限访问校友门户的 Token NFT ID 列表",
      authorizedTokenIds: [],
      lastUpdated: new Date().toISOString(),
      version: "1.0.0"
    };
  }
}

// 写入 TokenNFT.json 文件
async function writeTokenNFTFile(data) {
  try {
    await fs.writeFile(TOKEN_NFT_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入 TokenNFT.json 文件失败:', error);
    return false;
  }
}

// API 路由：获取当前的 Token NFT 列表
app.get('/api/token-nft', async (req, res) => {
  try {
    const data = await readTokenNFTFile();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '读取 Token NFT 列表失败' });
  }
});

// API 路由：添加新的 Token NFT 特征
app.post('/api/token-nft/add', async (req, res) => {
  try {
    const { tokenFeatures } = req.body;
    
    if (!tokenFeatures || !tokenFeatures.tokenId) {
      return res.status(400).json({ error: '无效的 Token 特征数据' });
    }

    const data = await readTokenNFTFile();
    
    // 检查 Token 特征是否已存在（基于不可篡改的特征）
    const existingFeature = data.authorizedTokenFeatures.find(feature => 
      feature.ipfsHash === tokenFeatures.ipfsHash && 
      feature.uri === tokenFeatures.uri
    );
    
    if (existingFeature) {
      return res.status(400).json({ error: 'Token 特征已存在' });
    }

    // 添加新的 Token 特征
    data.authorizedTokenFeatures.push(tokenFeatures);
    data.lastUpdated = new Date().toISOString();

    const success = await writeTokenNFTFile(data);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Token 特征已添加到授权列表`,
        data: data
      });
    } else {
      res.status(500).json({ error: '更新 Token NFT 列表失败' });
    }
  } catch (error) {
    console.error('添加 Token 特征时出错:', error);
    res.status(500).json({ error: '添加 Token 特征失败' });
  }
});

// API 路由：移除 Token ID
app.post('/api/token-nft/remove', async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    if (typeof tokenId !== 'number') {
      return res.status(400).json({ error: '无效的 Token ID' });
    }

    const data = await readTokenNFTFile();
    
    // 移除 Token ID
    const index = data.authorizedTokenIds.indexOf(tokenId);
    if (index > -1) {
      data.authorizedTokenIds.splice(index, 1);
      data.lastUpdated = new Date().toISOString();

      const success = await writeTokenNFTFile(data);
      
      if (success) {
        res.json({ 
          success: true, 
          message: `Token ID ${tokenId} 已从授权列表移除`,
          data: data
        });
      } else {
        res.status(500).json({ error: '更新 Token NFT 列表失败' });
      }
    } else {
      res.status(404).json({ error: 'Token ID 不存在' });
    }
  } catch (error) {
    console.error('移除 Token ID 时出错:', error);
    res.status(500).json({ error: '移除 Token ID 失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Token NFT 管理服务器运行在端口 ${PORT}`);
  console.log(`API 端点:`);
  console.log(`  GET  /api/token-nft - 获取 Token NFT 列表`);
  console.log(`  POST /api/token-nft/add - 添加 Token ID`);
  console.log(`  POST /api/token-nft/remove - 移除 Token ID`);
});
