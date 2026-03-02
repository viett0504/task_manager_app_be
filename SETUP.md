# Database Setup Guide

## Bước 1: Cài đặt PostgreSQL

### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Docker (Khuyến nghị)
```bash
docker-compose up -d postgres redis
```

## Bước 2: Tạo Database

```bash
# Kết nối PostgreSQL
psql postgres

# Tạo database
CREATE DATABASE taskflow_ai;

# Tạo user (optional)
CREATE USER taskflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskflow_ai TO taskflow_user;

# Thoát
\q
```

## Bước 3: Cấu hình Environment

```bash
# Copy file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin database của bạn
```

## Bước 4: Cài đặt Dependencies

```bash
npm install
```

## Bước 5: Chạy Migrations

```bash
# Chạy migrations để tạo tables
npm run migration:run

# Hoặc sync schema (development only)
npm run schema:sync
```

## Bước 6: Seed Data (Optional)

```bash
# Tạo dữ liệu test
npm run seed
```

Credentials sau khi seed:
- Admin: admin@taskflow.ai / Admin123!
- User: user1@taskflow.ai / Test123!

## Bước 7: Chạy Server

```bash
# Development mode
npm run dev

# Server sẽ chạy tại http://localhost:3000
```

## Kiểm tra

```bash
# Health check
curl http://localhost:3000/health

# Test register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

## Các lệnh hữu ích

```bash
# Tạo migration mới
npm run typeorm migration:create src/migrations/MigrationName

# Revert migration
npm run migration:revert

# Drop toàn bộ schema (cẩn thận!)
npm run schema:drop
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy: `brew services list` hoặc `docker ps`
- Kiểm tra thông tin trong .env file
- Kiểm tra port 5432 có bị chiếm không

### Lỗi migration
- Drop schema và chạy lại: `npm run schema:drop && npm run migration:run`
- Hoặc dùng synchronize trong development: `npm run schema:sync`
