# 后端集成说明

## 概述

## 新增文件结构

```
app/server/
├── package.json              # 后端依赖配置
├── server.js                 # Express 服务器主文件
├── config/
│   └── database.js          # 数据库配置（Sequelize）
├── models/
│   └── AuthorizedToken.js   # 数据模型
├── routes/
│   └── tokenNFT.js          # API 路由
├── sql/
│   └── init.sql             # 数据库初始化脚本
└── README.md                # 后端使用说明
```

## 快速开始

### 1. 安装后端依赖

```bash
cd app/server
npm install
```

### 2. 配置数据库

1. 使用 app/server/sql/init.sql 创建 MySQL 数据库
1. 编辑 `.env` 文件，配置数据库连接的参数：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
```

### 3. 启动后端服务器

开发模式（自动重启）：

```bash
cd app/server
npm run dev
```

生产模式：

```bash
cd app/server
npm start
```



## 数据库结构

### authorized_tokens 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| token_id | BIGINT | 区块链Token ID（唯一） |
| certificate_type | VARCHAR(255) | 证书类型 |
| university_name | VARCHAR(255) | 颁发机构 |
| ipfs_hash | VARCHAR(255) | IPFS哈希 |
| uri | VARCHAR(255) | Token URI |
| certificate_date | DATE | 颁发日期 |
| wallet_address | VARCHAR(255) | 接收者钱包地址 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## API 接口

### GET /api/token-nft

获取所有授权Token列表

**响应示例：**
```json
{
  "authorizedTokenFeatures": [
    {
      "tokenId": 12,
      "certificateType": "Token认证",
      "universityName": "University",
      "ipfsHash": "QmHash...",
      "uri": "random_uri",
      "certificateDate": "2025-10-19",
      "addedAt": "2025-10-19T07:30:53.674Z"
    }
  ],
  "lastUpdated": "2025-10-19T07:30:56.039Z"
}
```

### POST /api/token-nft/add

添加新的授权Token

**请求体：**
```json
{
  "tokenFeatures": {
    "tokenId": 13,
    "certificateType": "Token认证",
    "universityName": "University",
    "ipfsHash": "QmHash...",
    "uri": "random_uri",
    "certificateDate": "2025-10-20",
    "walletAddress": "0x..."
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Token已成功添加到授权列表",
  "data": {
    "tokenId": 13,
    "id": 1
  }
}
```
