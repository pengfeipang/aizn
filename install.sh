#!/bin/bash

# AI圈 - 服务器安装脚本
# 适用于 Ubuntu 22.04 / Debian 12

set -e

echo "=========================================="
echo "   AI圈 (AI Quan) - 服务器安装脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
  warn "建议使用 sudo 运行此脚本"
fi

# ==========================================
# 1. 系统更新
# ==========================================
info "更新系统包..."
apt update && apt upgrade -y

# ==========================================
# 2. 安装 Node.js
# ==========================================
info "安装 Node.js 20.x..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node --version
npm --version

# ==========================================
# 3. 安装 PostgreSQL
# ==========================================
info "安装 PostgreSQL..."
if ! command -v psql &> /dev/null; then
  apt install -y postgresql postgresql-contrib

  # 启动并启用 PostgreSQL
  systemctl start postgresql
  systemctl enable postgresql
fi

# ==========================================
# 4. 配置 PostgreSQL
# ==========================================
info "配置 PostgreSQL 数据库..."

# 设置数据库密码 (可以从环境变量或参数获取)
DB_PASSWORD="${DB_PASSWORD:-aiquan123}"

# 创建数据库和用户
sudo -u postgres psql <<EOF
-- 如果用户不存在则创建
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'aiquan') THEN
    CREATE USER aiquan WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

-- 创建数据库
SELECT 'CREATE DATABASE aiquan OWNER aiquan'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'aiquan')\gexec

-- 授权
GRANT ALL PRIVILEGES ON DATABASE aiquan TO aiquan;
EOF

info "PostgreSQL 配置完成"
info "数据库: aiquan"
info "用户: aiquan"
info "密码: ${DB_PASSWORD}"

# ==========================================
# 5. 安装 PM2 (进程管理)
# ==========================================
info "安装 PM2..."
npm install -g pm2

# ==========================================
# 6. 安装项目依赖
# ==========================================
info "安装项目依赖..."

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

npm install

# ==========================================
# 7. 配置环境变量
# ==========================================
if [ ! -f .env ]; then
  info "创建 .env 文件..."
  cp .env.example .env

  # 更新 DATABASE_URL
  sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://aiquan:${DB_PASSWORD}@localhost:5432/aiquan?schema=public\"|" .env

  # 生成安全密钥
  ENCRYPTION_KEY=$(openssl rand -hex 32)
  HASH_SALT=$(openssl rand -hex 16)
  sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=${ENCRYPTION_KEY}|" .env
  sed -i "s|HASH_SALT=.*|HASH_SALT=${HASH_SALT}|" .env

  info "安全密钥已自动生成"
fi

# ==========================================
# 8. 初始化数据库
# ==========================================
info "初始化 Prisma 和数据库..."
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# ==========================================
# 9. 构建前端 (React)
# ==========================================
info "构建前端 (React)..."
cd client
npm install
npm run build
cd ..

# ==========================================
# 10. 构建后端
# ==========================================
info "构建后端..."
npm run build

# ==========================================
# 11. 配置 PM2
# ==========================================
info "配置 PM2..."

cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'aiquan',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF

# 创建日志目录
mkdir -p logs

# ==========================================
# 12. 启动服务
# ==========================================
info "启动服务..."
pm2 start ecosystem.config.js
pm2 save

# ==========================================
# 13. 配置 Nginx (可选)
# ==========================================
if command -v nginx &> /dev/null; then
  info "检测到 Nginx，配置反向代理..."

  cat > /etc/nginx/sites-available/aiquan <<'EOF'
server {
    listen 80;
    server_name _;  # 替换为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

  ln -sf /etc/nginx/sites-available/aiquan /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx

  info "Nginx 配置完成"
fi

# ==========================================
# 完成
# ==========================================
echo ""
echo -e "${GREEN}=========================================="
echo "   安装完成!"
echo "==========================================${NC}"
echo ""
echo "服务状态:"
pm2 status
echo ""
echo "常用命令:"
echo "  pm2 status          # 查看服务状态"
echo "  pm2 logs aiquan     # 查看日志"
echo "  pm2 restart aiquan  # 重启服务"
echo "  pm2 stop aiquan     # 停止服务"
echo ""
echo "数据库连接信息:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: aiquan"
echo "  User: aiquan"
echo "  Password: ${DB_PASSWORD}"
echo ""
echo "访问地址: http://localhost:3000"
