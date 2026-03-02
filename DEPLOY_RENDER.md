# Hướng dẫn Deploy Backend lên Render

## Bước 1: Chuẩn bị Repository

1. Push code lên GitHub (nếu chưa có):
```bash
cd back_end
git init
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Bước 2: Tạo tài khoản Render

1. Truy cập: https://render.com
2. Đăng ký tài khoản (có thể dùng GitHub để đăng nhập)
3. Xác thực email

## Bước 3: Deploy bằng render.yaml (Khuyến nghị)

### Cách 1: Deploy tự động với Blueprint

1. Vào Dashboard Render
2. Click "New" → "Blueprint"
3. Connect GitHub repository của bạn
4. Render sẽ tự động phát hiện file `render.yaml`
5. Click "Apply" để tạo services

Render sẽ tự động tạo:
- Web Service (API)
- PostgreSQL Database
- Tự động setup environment variables

### Cách 2: Deploy thủ công

#### 2.1. Tạo PostgreSQL Database

1. Vào Dashboard → "New" → "PostgreSQL"
2. Điền thông tin:
   - Name: `taskflow-db`
   - Database: `taskflow_ai`
   - Region: Singapore (gần Việt Nam nhất)
   - Plan: Free
3. Click "Create Database"
4. Đợi database khởi tạo (2-3 phút)
5. Copy "Internal Database URL" để dùng sau

#### 2.2. Tạo Web Service

1. Vào Dashboard → "New" → "Web Service"
2. Connect GitHub repository
3. Điền thông tin:
   - Name: `taskflow-api`
   - Region: Singapore
   - Branch: `main`
   - Root Directory: `back_end` (nếu backend nằm trong subfolder)
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free

4. Thêm Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<paste-internal-database-url-from-step-2.1>
   JWT_SECRET=<random-string-32-chars>
   JWT_REFRESH_SECRET=<random-string-32-chars>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

5. Advanced Settings:
   - Health Check Path: `/api/health`
   - Auto-Deploy: Yes

6. Click "Create Web Service"

## Bước 4: Chạy Migrations

Sau khi deploy thành công:

1. Vào Web Service → "Shell" tab
2. Chạy lệnh:
```bash
npm run migration:run
```

3. Seed dữ liệu (optional):
```bash
npm run seed
npm run seed:tasks
npm run seed:team-members
```

## Bước 5: Kiểm tra

1. Truy cập URL của service (ví dụ: `https://taskflow-api.onrender.com`)
2. Test health check:
   ```
   GET https://taskflow-api.onrender.com/api/health
   ```
3. Test login:
   ```
   POST https://taskflow-api.onrender.com/api/auth/login
   Body: {
     "email": "admin@gmail.com",
     "password": "1"
   }
   ```

## Bước 6: Cập nhật Frontend

Cập nhật URL trong `front_end/lib/config/environment.dart`:

```dart
class Environment {
  static const String production = 'https://taskflow-api.onrender.com/api';
  static const String physicalDevice = 'http://192.168.4.72:3000/api';
  
  static String get baseUrl {
    return production; // Đổi sang production
  }
}
```

## Lưu ý quan trọng

### Free Plan Limitations:
- Service sẽ sleep sau 15 phút không hoạt động
- Request đầu tiên sau khi sleep sẽ mất 30-60 giây để wake up
- 750 giờ/tháng (đủ cho 1 service chạy 24/7)
- Database: 1GB storage

### Tối ưu cho Free Plan:
1. Thêm health check để giữ service active
2. Sử dụng cron job để ping service mỗi 10 phút
3. Hoặc nâng cấp lên Starter plan ($7/tháng) để không bị sleep

### Monitoring:
- Xem logs: Dashboard → Service → Logs
- Metrics: Dashboard → Service → Metrics
- Events: Dashboard → Service → Events

### Troubleshooting:

**Lỗi: Database connection failed**
- Kiểm tra DATABASE_URL đã đúng chưa
- Kiểm tra database đã khởi tạo xong chưa

**Lỗi: Build failed**
- Kiểm tra `package.json` có đầy đủ dependencies
- Kiểm tra TypeScript compile không lỗi

**Lỗi: Service crashed**
- Xem logs để tìm lỗi cụ thể
- Kiểm tra environment variables

## Cập nhật Code

Mỗi khi push code mới lên GitHub:
1. Render sẽ tự động detect và deploy lại
2. Hoặc manual deploy: Dashboard → Service → "Manual Deploy"

## Backup Database

1. Dashboard → Database → "Backups"
2. Free plan: Manual backup only
3. Paid plan: Automatic daily backups

## Custom Domain (Optional)

1. Dashboard → Service → Settings → Custom Domain
2. Thêm domain của bạn
3. Cập nhật DNS records theo hướng dẫn

---

## Tóm tắt các file đã tạo:

- ✅ `render.yaml` - Blueprint config cho auto-deploy
- ✅ `.dockerignore` - Loại bỏ files không cần thiết
- ✅ Updated `src/config/database.ts` - Hỗ trợ DATABASE_URL
- ✅ Updated `src/config/redis.ts` - Hỗ trợ REDIS_URL
- ✅ Updated `src/app.ts` - Thêm health check endpoint

Backend của bạn đã sẵn sàng để deploy! 🚀
