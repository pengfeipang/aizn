#!/bin/bash

# AI圈 - 服务器安装脚本
# 适用于 Ubuntu/Debian (apt) 和 CentOS/RHEL/Alibaba Cloud Linux (dnf/yum)

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

# 检测包管理器
detect_package_manager() {
  if command -v apt &> /dev/null; then
    PKG_MANAGER="apt"
    PKG_INSTALL="apt install -y"
    PKG_UPDATE="apt update && apt upgrade -y"
  elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    PKG_INSTALL="dnf install -y"
    PKG_UPDATE="dnf upgrade -y"
  elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
    PKG_INSTALL="yum install -y"
    PKG_UPDATE="yum update -y"
  else
    error "不支持的系统，找不到 apt/dnf/yum"
  fi
  info "检测到包管理器: $PKG_MANAGER"
}

detect_package_manager

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
  error "请使用 root 用户或 sudo 运行此脚本"
fi

# 获取脚本所在目录（保存原始目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
info "项目目录: $SCRIPT_DIR"

# ==========================================
# 1. 系统更新
# ==========================================
info "更新系统包..."
$PKG_UPDATE || warn "系统更新部分失败，继续..."

# ==========================================
# 2. 安装 Node.js
# ==========================================
info "安装 Node.js 20.x..."
if ! command -v node &> /dev/null; then
  if [ "$PKG_MANAGER" = "apt" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    $PKG_INSTALL nodejs
  fi
fi
node --version
npm --version

# ==========================================
# 3. 安装 PostgreSQL
# ==========================================
info "安装 PostgreSQL..."
if ! command -v psql &> /dev/null; then
  if [ "$PKG_MANAGER" = "apt" ]; then
    apt install -y postgresql postgresql-contrib
  else
    $PKG_INSTALL postgresql-server postgresql-contrib
    postgresql-setup --initdb || warn "PostgreSQL 可能已初始化"
  fi

  systemctl start postgresql
  systemctl enable postgresql
fi

# ==========================================
# 4. 配置 PostgreSQL
# ==========================================
info "配置 PostgreSQL 数据库..."

DB_PASSWORD="${DB_PASSWORD:-aiquan123}"

# RHEL/CentOS 需要先配置认证方式
if [ "$PKG_MANAGER" != "apt" ]; then
  PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
  if [ -f "$PG_HBA" ]; then
    info "配置 PostgreSQL 认证方式..."
    cp "$PG_HBA" "${PG_HBA}.bak" 2>/dev/null || true
    sed -i 's/local\s*all\s*all\s*peer/local all all trust/' "$PG_HBA"
    sed -i 's/local\s*all\s*all\s*ident/local all all trust/' "$PG_HBA"
    sed -i 's/host\s*all\s*all\s*127.0.0.1\/32\s*ident/host all all 127.0.0.1\/32 trust/' "$PG_HBA"
    sed -i 's/host\s*all\s*all\s*::1\/128\s*ident/host all all ::1\/128 trust/' "$PG_HBA"
    systemctl restart postgresql
  fi
fi

# 创建数据库和用户
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'aiquan') THEN
    CREATE USER aiquan WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE aiquan OWNER aiquan'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'aiquan')\gexec

GRANT ALL PRIVILEGES ON DATABASE aiquan TO aiquan;
EOF

info "PostgreSQL 配置完成"
info "数据库: aiquan | 用户: aiquan | 密码: ${DB_PASSWORD}"

# ==========================================
# 5. 安装 PM2
# ==========================================
info "安装 PM2..."
npm install -g pm2

# ==========================================
# 6. 安装项目依赖
# ==========================================
info "安装项目依赖..."
cd "$SCRIPT_DIR"
chown -R root:root "$SCRIPT_DIR" 2>/dev/null || true
chmod -R 755 "$SCRIPT_DIR" 2>/dev/null || true
npm install

# ==========================================
# 7. 配置环境变量
# ==========================================
if [ ! -f .env ]; then
  info "创建 .env 文件..."
  cp .env.example .env
  sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://aiquan:${DB_PASSWORD}@localhost:5432/aiquan?schema=public\"|" .env
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
npx prisma db seed || warn "种子数据可能已存在"

# ==========================================
# 9. 构建项目
# ==========================================
info "构建项目..."
npm run build

# ==========================================
# 10. 配置 PM2
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
mkdir -p logs
chmod 755 logs

# ==========================================
# 11. 启动服务
# ==========================================
info "启动服务..."
pm2 start ecosystem.config.js
pm2 save

# ==========================================
# 12. 配置 Nginx (可选)
# ==========================================
if command -v nginx &> /dev/null; then
  info "检测到 Nginx，配置反向代理..."

  if [ "$PKG_MANAGER" = "apt" ]; then
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
  else
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
  fi

  # 确保目录存在
  mkdir -p "$NGINX_CONF_DIR" 2>/dev/null || true

  if [ -d "$NGINX_CONF_DIR" ]; then
    cat > "$NGINX_CONF_DIR/aiquan.conf" <<'NGINX_EOF'
server {
    listen 80;
    server_name _;

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
NGINX_EOF

    if [ "$PKG_MANAGER" = "apt" ] && [ -d "$NGINX_ENABLED_DIR" ]; then
      ln -sf "$NGINX_CONF_DIR/aiquan.conf" "$NGINX_ENABLED_DIR/"
    fi

    if nginx -t 2>/dev/null; then
      systemctl reload nginx && info "Nginx 配置完成"
    else
      warn "Nginx 配置测试失败，请手动检查"
    fi
  else
    warn "无法创建 Nginx 配置目录，跳过"
  fi
else
  info "未检测到 Nginx，跳过反向代理配置"
fi

# ==========================================
# 完成
# ==========================================
echo ""
echo -e "${GREEN}=========================================="
echo "   安装完成!"
echo "==========================================${NC}"
echo ""
echo "系统信息:"
echo "  包管理器: $PKG_MANAGER"
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
