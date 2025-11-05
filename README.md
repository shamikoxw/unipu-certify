# MY Certify: Mint Your Academic Certificates as NFTs 🎓🔗

## 项目介绍

MY CERTIFY (a fork of UNIPU Certify) 是一款 Web3 应用，支持教育机构将 PDF 证书铸造为非同质化代币 (NFT)。该项目基于以太坊 Sepolia 测试网络构建，使用 IPFS 进行去中心化存储，允许用户直接在区块链上查看和验证其学术证书。

- 前端：Vue 3 + Vite

- 后端：Node.js + Express

- 数据库：MySQL

## 项目结构概览

- **`/`**
  - `README.md`/`README_BACKEND.md`: 项目与后端说明
  - `app/`: 前端 + 后端项目

- **`/app/`**
  - `index.html`/`vite.config.js`/`tailwind.config.js`/`postcss.config.js`: 前端构建与样式配置
  - `package.json`/`package-lock.json`: 前端依赖与脚本
  - `public/`: 静态资源与站点图标
  - `src/` 前端源码（Vue 3 + Vite）
    - `main.js`: 应用入口，Pinia 等初始化
    - `App.vue`: 根组件
    - `router/`: `index.js` 路由配置
    - `store.js`: Pinia 全局状态
    - `components/`: 基础组件（如 `Card.vue`、`Search.vue`）
    - `views/`: 页面视图
      - `UploadView.vue`: 上传 PDF 到 IPFS 并铸造 NFT
      - `TokenMintView.vue`: 无文件的 Token 认证铸造
      - 其他：`MainView.vue`、`MyDocuments.vue`、`AlumniView.vue`
    - `ethersService.js`: 以太坊交互，初始化合约、交易调用、查询
    - `pinataService.js`: 调用 Pinata API 上传文件至 IPFS
    - `abi.js`: 合约 ABI
    - `style.css`/`assets/`: 样式与资源
  - `server/` 后端（Node.js + Express + Sequelize + MySQL）
    - `server.js`: 服务入口、CORS/JSON 中间件、健康检查、路由挂载
    - `routes/`: `tokenNFT.js` Token 授权相关 REST API（查询/新增）
    - `models/`: `AuthorizedToken.js` 授权 Token 表模型
    - `config/`: `database.js` 数据库连接配置
    - `sql/`: `init.sql` 初始化 SQL
    - `package.json`/`package-lock.json`: 后端依赖与脚本

## 项目食用指南

### step0 准备工作

> 本项目需要Node.js 运行环境，默认您已经安装好

> 建议开发IDE
>
> - Vue  ：IntelliJ IDEA
> - Solidity：Remix

1. 首先下载或克隆项目到本地

   ```bash
   git clone https://github.com/shamikoxw/unipu-certify.git
   ```

2. 在桌面浏览器安装 MetaMask 插件（Chrome/Edge/Brave 均可），到浏览器扩展商店搜索“MetaMask”并安装


<mark>**注：仓库的项目文件中已经配置好了测试用的钱包等（用附录的助记词导入），如需直接使用请跳至step4；如需另创建和使用自己的配置请继续阅读** </mark>

### step1 配置钱包

> 由于测试网难连接，建议在科学上网的环境下继续以下工作

#### [1] 创建钱包

1. 打开 MetaMask 插件，点击“创建钱包”，设置强密码。
2. 抄写并妥善保存“助记词”（12/24个英文单词）。不要截屏、不要发给任何人。

#### [2] 切换到以太坊 Sepolia 测试网

1. 打开 MetaMask → 右上角头像 → 设置 → 高级 → 打开“显示测试网络”。
2. 切换网络：点击左侧中间的 Ethereum Mainnet，弹出 `select network` 窗口，选择 custom —— Sepolia

#### [3] 领取免费的测试币（Sepolia ETH）

> 由于区块链上传输需要少量ETH作为“燃料”，故需要领取测试币

- 打开一个水龙头（任选其一，按提示粘贴你的钱包地址领取）：
    - https://sepolia-faucet.pk910.de

      （需要提供几分钟的CPU算力）

    - https://faucets.chain.link/sepolia

- 领取成功后，MetaMask 里应能看到少量 Sepolia ETH 余额（可能需要等待1-2分钟）



### step2 准备IPFS

> InterPlanetary File System, IPFS是一种用于文件存储、查找和访问的分布式网络框架，其设计目标是创建一个可靠、高效、去中心化的数据分发系统。
>
> 它的工作原理是将上传到IPFS 系统中的文件进行分块并存储到分布式节点中，同时每个块都将被赋予不同的哈希值。当用户请求文件时，IPFS 使用这些哈希值来定位各个块的位置，并将其重新组合以形成原始文件。

这里我们使用的是Pinata JWT

> Pinata JWT（JSON Web Token）是 Pinata 平台用于**身份验证和授权**的一种安全机制。Pinata JWT 主要用于通过 Pinata API 进行认证和访问控制。当你使用 Pinata SDK 或直接调用 Pinata API 时，需要使用 JWT 作为凭证来证明你的身份，并确保你有权限执行相应的操作（例如上传文件、查询文件列表等）。

#### [1] 注册Pinata账户和JWT

- 打开 https://pinata.cloud/ ，注册账户
- API Keys  → New Key ，输入名称并勾选Admin
- 记录好给出的三个API信息

#### [2] 前端配置JWT

- 在 `/app` 目录创建 `.env` 文件，写入上述API信息：

```bash
VITE_PINATA_API_KEY=fillme
VITE_PINATA_API_SECRET=fillme
VITE_PINATA_JWT=fillme
```



### step3 配置合约

#### [1] 部署合约到 Sepolia

使用Remix的网页工具来完成合约的编译和运行，当然也可以下载它的客户端

准备：

- 浏览器装好 MetaMask，网络切到 Sepolia，账户里有少量测试 ETH
- 打开 Remix（推荐）:`https://remix.ethereum.org`

步骤：

1) 在 Remix 新建文件

- 在左侧栏 File Explorer 新建文件 `AcademicCertificate.sol`
- 将你仓库里的 `Smart Contract/AcademicCertificate.sol` 源码完整粘贴进去

2) 处理 OpenZeppelin 依赖

- 代码里有 `import "@openzeppelin/contracts/..."`
- Remix 一般可直接解析；若出现导入错误，改用 GitHub 源地址导入，例如：
    - `import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";`
    - `import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/utils/Counters.sol";`
    - `import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable.sol";`

3) 编译

- 左侧栏 进入 “Solidity Compiler”
- 选择与源码匹配的编译器版本（≥ 0.8.0，例如 0.8.20） ，点击 Compile

4) 部署

- 左侧栏 进入 “Deploy & run transactions”
- 环境选择 rowser extension —— Sepolia Testnet – MetaMask，在MetaMask 选择连接
- 账户应为你当前 MetaMask 账号（这将成为合约 owner 与 admin）
- 选择 `AcademicCertificate` 合约，其余默认，点击 “Deploy”，在 MetaMask 确认交易
- 交易完成后，在控制台中复制 `合约地址`（绿色地址的后缀，以0x开头的42位字符）

> 提示：该合约将部署者地址同时设为 `owner` 和 `admin`，并且 `mint` 有 `onlyOwner` + `require(msg.sender == admin)` 双重限制，所以后续铸造必须使用部署这份合约的钱包。

#### [2] 前端配置合约地址

位置：`app/src/ethersService.js`

- 找到常量：

```startLine:endLine:app/src/ethersService.js
const contractAddress = "0x9A4169AEE84d196Fd85765A710dA1437EBEbfbC4";
```

- 将该值替换为你刚部署的“新合约地址”，保存文件。Vite 开发服务会热更新；若未生效，重启 `npm run dev`。



### step4 配置和运行后端

> 更多后端说明请查看 `README_BACKEND.md`

#### [1] 安装后端依赖

```bash
cd app/server
npm install
```

#### [2] 配置数据库

1. 使用 app/server/sql/init.sql 创建 MySQL 数据库
2. 编辑 `.env` 文件，配置数据库连接的参数：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
```

#### [3] 启动后端服务器

开发模式（自动重启）：

```bash
cd app/server
npm run dev
```

后端服务器将在 `http://localhost:3001` 运行



### step5 配置和运行前端

#### [1] 安装前端依赖

```bash
cd app
npm install
```

#### [2] 运行前端

```bash
cd app
npm run dev
```

#### [3] 测试 

进入 http://localhost:5173 ，连接钱包

> **注意**：确保后端服务器正在运行（端口3001），否则校友门户功能将无法正常工作

如左侧显示 `欢迎你，管理员！` ，则说明合约配置正确，当前身份为管理员，可以上传文件

点击上传新文档，测试上传文件

1. 输入钱包地址（点击MetaMask中的收款）
2. 点击提交
3. 在弹出的MetaMask中确认交易请求

最后在主页和钱包内验证NFT的显示

### 附录（测试例）

#### 钱包私钥助记符

保存您的私钥助记词
这是您的 。按正确顺序写下来，保存在安全的地方。如果他人拥有您的私钥助记词，便可获得您的钱包访问权限。
切勿与任何人分享此助记词。

按顺序排序：

1. resource
2. dash
3. broom
4. width
5. usage
6. bag
7. hope
8. reason
9. patrol
10. unique
11. fuel
12. asset

导入：

```
resource dash broom width usage bag hope reason patrol unique fuel asset
```

#### Pinata JWT

```
API Key: dd5ab0179f7da8636c7d
API Secret: d7edbf1fb9b4fb77906fa196aa1e8454ca497119d1abeaebccf3842d14e42081
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0YTQ3YzAwYi1kYzkxLTRiMjEtYmNmZC0yMTVhMTZhOWMxNzYiLCJlbWFpbCI6ImZheXNtYW4yQG91dGxvb2suY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRkNWFiMDE3OWY3ZGE4NjM2YzdkIiwic2NvcGVkS2V5U2VjcmV0IjoiZDdlZGJmMWZiOWI0ZmI3NzkwNmZhMTk2YWExZTg0NTRjYTQ5NzExOWQxYWJlYWViY2NmMzg0MmQxNGU0MjA4MSIsImV4cCI6MTc5MjIwNzE3OH0.6k-w_Cw3ZOvq1n-WsAqgx9loTmU6TBX8OKK5yMRDNzo
```

#### 合约

```
0xBbe71affc1D00a4b838147F079A4D4461b88EEe9
```

