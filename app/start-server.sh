#!/bin/bash
echo "启动 Token NFT 管理服务器..."
echo ""
echo "请确保已安装 Node.js 和 npm"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install express cors
    echo ""
fi

echo "启动服务器..."
node server.js
