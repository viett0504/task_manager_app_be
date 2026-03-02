# Deploy Backend lên Render - Hướng dẫn nhanh

## Bước 1: Generate JWT Secrets
```bash
cd back_end
npm run generate:secrets
```
Copy 2 secrets được tạo ra để dùng ở bước 3.

## Bước 2: Push code lên GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push
```

## Bước 3: Deploy trên Render

### Option A: Blueprint (Khuyến nghị - Tự động)

1. Vào https://render.com và đăng nhập
2. Click "New" → "Blueprint"
3. Connect GitHub repository
4. Render tự động phát hiện `render.yaml`
5. Click "Apply"

Render sẽ tự động:
- Tạo PostgreSQL database
- Deploy API service
- Link DATABASE_URL
- Generate JWT secrets

### Option B: Manual (Nếu Blueprint không work)

#### 3.1. Tạo Database trước
1. Dashboard → New → PostgreSQL
2. Name: `taskflow-db`
3. Database: `taskflow_ai`
4. Region: Singapore
5. Plan: Free
6. Create Database
7. Đợi 2-3 phút
8. Copy "Internal Database URL"

#### 3.2. Tạo Web Service
1. Dashboard → New → Web Service
2. Connect GitHub repo
3. Settings:
   - Name: `taskflow-api`
   - Region: Singapore
   - Root Directory: `back_end` (nếu backend trong subfolder)
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Plan: Free

4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste-url-from-step-3.1>
   JWT_SECRET=<paste-from-step-1>
   JWT_REFRESH_SECRET=<paste-from-step-1>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   REDIS_HOST=
   REDIS_PORT=
   ```

5. Advanced:
   - Health Check Path: `/api/health`
   - Auto-Deploy: Yes

6. Create Web Service

## Bước 4: Đợi Deploy (5-10 phút)

Theo dõi:
- Dashboard → Service → Logs
- Tìm dòng: `✅ Database connected` và `🚀 Server running`

## Bước 5: Chạy Migrations

Sau khi deploy xong:

1. Vào Service → Shell tab
2. Chạy:
```bash
npm run migration:run
npm run seed
npm run seed:tasks
```

## Bước 6: Test API

URL của bạn: `https://your-service-name.onrender.com`

Test health:
```bash
curl https://your-service-name.onrender.com/api/health
```

Test login:
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"1"}'
```

## Bước 7: Cập nhật Frontend

File: `front_end/lib/config/environment.dart`

```dart
static const String production = 'https://your-service-name.onrender.com/api';
```

Xong! 🎉

---

## ⚠️ Nếu gặp lỗi ECONNREFUSED

Xem file `RENDER_TROUBLESHOOTING.md` để fix.

Tóm tắt:
1. Kiểm tra Environment Variables có `DATABASE_URL` chưa
2. Nếu chưa, copy từ Database → Info → Internal Database URL
3. Paste vào Service → Environment → DATABASE_URL
4. Save và đợi redeploy

---

## Lưu ý Free Plan:
- Service sleep sau 15 phút không dùng
- Request đầu tiên sau sleep mất ~30s
- 750 giờ/tháng miễn phí
- Database: 1GB storage

## Giữ service active:
Dùng cron-job.org hoặc UptimeRobot ping mỗi 10 phút:
```
https://your-service.onrender.com/api/health
```
