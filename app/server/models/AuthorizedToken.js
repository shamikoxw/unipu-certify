import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuthorizedToken = sequelize.define('AuthorizedToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    comment: '区块链上的Token ID'
  },
  certificate_type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '证书类型'
  },
  university_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '颁发机构'
  },
  ipfs_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'IPFS哈希'
  },
  uri: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Token URI'
  },
  certificate_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '颁发日期'
  },
  wallet_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '接收者钱包地址'
  }
}, {
  tableName: 'authorized_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['token_id']
    },
    {
      fields: ['wallet_address']
    }
  ]
});

export default AuthorizedToken;
