import express from 'express';
import AuthorizedToken from '../models/AuthorizedToken.js';

const router = express.Router();

// GET /api/token-nft - 获取所有授权Token列表
router.get('/', async (req, res) => {
  try {
    const tokens = await AuthorizedToken.findAll({
      order: [['created_at', 'DESC']]
    });

    const authorizedTokenFeatures = tokens.map(token => ({
      tokenId: token.token_id,
      certificateType: token.certificate_type,
      universityName: token.university_name,
      ipfsHash: token.ipfs_hash,
      uri: token.uri,
      certificateDate: token.certificate_date,
      addedAt: token.created_at.toISOString()
    }));

    res.json({
      authorizedTokenFeatures,
      lastUpdated: tokens.length > 0 
        ? tokens[0].updated_at.toISOString() 
        : new Date().toISOString()
    });
  } catch (error) {
    console.error('获取Token列表失败:', error);
    res.status(500).json({ 
      error: '获取Token列表失败',
      message: error.message 
    });
  }
});

// POST /api/token-nft/add - 添加新的授权Token
router.post('/add', async (req, res) => {
  try {
    const { tokenFeatures } = req.body;

    // 验证必填字段
    if (!tokenFeatures || !tokenFeatures.tokenId) {
      return res.status(400).json({ 
        error: '缺少必填字段',
        message: 'tokenFeatures.tokenId 是必需的' 
      });
    }

    // 检查Token ID是否已存在
    const existingToken = await AuthorizedToken.findOne({
      where: { token_id: tokenFeatures.tokenId }
    });

    if (existingToken) {
      return res.status(409).json({ 
        error: 'Token已存在',
        message: `Token ID ${tokenFeatures.tokenId} 已经存在于授权列表中` 
      });
    }

    // 创建新记录
    const newToken = await AuthorizedToken.create({
      token_id: tokenFeatures.tokenId,
      certificate_type: tokenFeatures.certificateType || '',
      university_name: tokenFeatures.universityName || '',
      ipfs_hash: tokenFeatures.ipfsHash || '',
      uri: tokenFeatures.uri || '',
      certificate_date: tokenFeatures.certificateDate || new Date(),
      wallet_address: tokenFeatures.walletAddress || ''
    });

    res.status(201).json({
      success: true,
      message: 'Token已成功添加到授权列表',
      data: {
        tokenId: newToken.token_id,
        id: newToken.id
      }
    });
  } catch (error) {
    console.error('添加Token失败:', error);
    res.status(500).json({ 
      error: '添加Token失败',
      message: error.message 
    });
  }
});

export default router;
