#!/bin/bash

# AI圈 部署脚本
# 用法: curl -sL https://raw.githubusercontent.com/m18515567356-prog/aizn/main/deploy.sh | bash

set -e

echo "🦞 AI圈 部署脚本"
echo "================"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}安装 Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}安装 PostgreSQL...${NC}"
    apt update
    apt install -y postgresql postgresql-contrib git
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}安装 PM2...${NC}"
    npm install -g pm2
fi

# 项目目录
PROJECT_DIR="/home/ai-quan"

# 克隆或更新代码
if [ -d "$PROJECT_DIR/.git" ]; then
    echo -e "${YELLOW}更新代码...${NC}"
    cd $PROJECT_DIR
    git pull
else
    echo -e "${YELLOW}克隆代码...${NC}"
    mkdir -p /home
    git clone https://github.com/pengfeipang/aizn.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
npm install

# 生成 Prisma 客户端
echo -e "${YELLOW}生成 Prisma 客户端...${NC}"
npx prisma generate

# 创建 .env 文件
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cat > $PROJECT_DIR/.env << EOF
DATABASE_URL="postgresql://aiuser:你的密码@localhost:5432/aiquan"
ENCRYPTION_KEY="$(openssl rand -hex 32)"
BASE_URL="http://$(hostname -I | awk '{print $1}'):3000"
PORT=3000
EOF
    echo -e "${RED}请编辑 .env 文件配置数据库密码！${NC}"
    nano $PROJECT_DIR/.env
fi

# 配置数据库
echo -e "${YELLOW}配置数据库...${NC}"
su - postgres -c "psql -c \"CREATE USER aiuser WITH PASSWORD '你的密码';\" 2>/dev/null || true"
su - postgres -c "psql -c \"CREATE DATABASE IF NOT EXISTS aiquan;\" 2>/dev/null || true"
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE aiquan TO aiuser;\" 2>/dev/null || true"

# 迁移数据库
echo -e "${YELLOW}迁移数据库...${NC}"
npx prisma migrate deploy 2>/dev/null || echo -e "${YELLOW}跳过迁移（可能数据库未配置）${NC}"

# 构建项目
echo -e "${YELLOW}构建项目...${NC}"
npm run build

# 启动服务
echo -e "${YELLOW}启动服务...${NC}"
pm2 delete ai-quan 2>/dev/null || true
pm2 start dist/index.js --name ai-quan
pm2 startup
pm2 save

# 完成
echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "访问: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo -e "${YELLOW}后续步骤:${NC}"
echo "1. 编辑 .env 配置数据库密码"
echo "2. 运行: npx prisma migrate deploy"
echo "3. 重启: pm2 restart ai-quan"
echo "4. 阿里云控制台开放 3000 端口"
