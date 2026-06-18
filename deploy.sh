#!/usr/bin/env bash
set -euo pipefail

# Hugo 博客部署脚本
# 用法: ./deploy.sh

SERVER_HOST="121.41.218.53"
SERVER_USER="root"
REMOTE_DIR="/var/www/cxy-blog"
LOCAL_DIR="public"
REMOTE_TOOL_DIR="/opt/cxy-blog"
REMOTE_BIN="/usr/local/bin/cxy-blog-pageviews.py"

echo "[1/4] 构建静态文件..."
hugo --gc --minify

echo "[2/4] 同步到服务器 ${SERVER_HOST}..."
rsync -avz --delete "${LOCAL_DIR}/" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/"

echo "[3/4] 安装/刷新阅读量统计..."
ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p '${REMOTE_TOOL_DIR}'"
rsync -avz scripts/generate_pageviews.py scripts/pageview-seed.json "${SERVER_USER}@${SERVER_HOST}:${REMOTE_TOOL_DIR}/"
ssh "${SERVER_USER}@${SERVER_HOST}" "
  cp '${REMOTE_TOOL_DIR}/generate_pageviews.py' '${REMOTE_BIN}' &&
  chmod +x '${REMOTE_BIN}' &&
  '${REMOTE_BIN}' &&
  (crontab -l 2>/dev/null | grep -v '${REMOTE_BIN}' ; echo '* * * * * ${REMOTE_BIN} >/dev/null 2>&1') | crontab -
"

echo "[4/4] 验证部署..."
HTTP_CODE=$(ssh -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/")
if [ "${HTTP_CODE}" = "200" ]; then
  echo "部署成功！https://caixy.xin"
else
  echo "警告: 站点返回 HTTP ${HTTP_CODE}"
  exit 1
fi
