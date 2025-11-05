-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS my_certify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE my_certify;

-- 创建授权Token表
CREATE TABLE IF NOT EXISTS authorized_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_id BIGINT NOT NULL UNIQUE COMMENT '区块链上的Token ID',
  certificate_type VARCHAR(255) NOT NULL COMMENT '证书类型',
  university_name VARCHAR(255) NOT NULL COMMENT '颁发机构',
  ipfs_hash VARCHAR(255) NOT NULL COMMENT 'IPFS哈希',
  uri VARCHAR(255) NOT NULL COMMENT 'Token URI',
  certificate_date DATE NOT NULL COMMENT '颁发日期',
  wallet_address VARCHAR(255) NOT NULL COMMENT '接收者钱包地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_wallet_address (wallet_address),
  INDEX idx_token_id (token_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='授权Token列表';
