#!/usr/bin/env bash
set -euo pipefail

# Hugo 博客部署脚本
# 用法: ./deploy.sh

SERVER_HOST="121.41.218.53"
SERVER_USER="root"
REMOTE_DIR="/var/www/cxy-blog"
LOCAL_DIR="public"

echo "[1/3] 构建静态文件..."
hugo --gc --minify

echo "[2/3] 同步到服务器 ${SERVER_HOST}..."
rsync -avz --delete "${LOCAL_DIR}/" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/"

echo "[3/3] 验证部署..."
HTTP_CODE=$(ssh -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/")
if [ "${HTTP_CODE}" = "200" ]; then
  echo "部署成功！https://caixy.xin"
else
  echo "警告: 站点返回 HTTP ${HTTP_CODE}"
  exit 1
fi
