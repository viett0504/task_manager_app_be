# Render Deployment - Troubleshooting

## Lỗi: ECONNREFUSED 127.0.0.1:5432

### Nguyên nhân:
App đang cố kết nối database ở localhost thay vì dùng DATABASE_URL từ Render.

### Giải pháp:

#### Cách 1: Kiểm tra Environment Variables

1. Vào Render Dashboard → Service → Environment
2. Kiểm tra có biến `DATABASE_URL` chưa
3. Nếu chưa có, thêm thủ công:
   - Vào Database → Info → Copy "Internal Database URL"
   - Vào Service → Environment → Add Environment Variable
   - Key: `DATABASE_URL`
   - Value: paste URL vừa copy

#### Cách 2: Redeploy với Blueprint

1. Xóa service cũ (nếu có)
2. Vào Dashboard → New → Blueprint
3. Connect GitHub repo
4. Render sẽ tự động tạo database và link DATABASE_URL

#### Cách 3: Manual Deploy

Nếu đã có database nhưng service không connect được:

1. Vào Database → Info
2. Copy "Internal Database URL" (dạng: `postgresql://user:pass@host:5432/db`)
3. Vào Service → Environment
4. Thêm/Update biến `DATABASE_URL` với URL vừa copy
5. Click "Save Changes"
6. Service sẽ tự động redeploy

### Kiểm tra sau khi fix:

```bash
# Check logs
Dashboard → Service → Logs

# Tìm dòng:
✅ Database connected
🚀 Server running on port 10000
```

---

## Lỗi: Health check timeout

### Nguyên nhân:
- Database chưa sẵn sàng
- Build chưa xong
- Port không đúng

### Giải pháp:

1. Đợi 5-10 phút cho database khởi tạo
2. Kiểm tra Build Logs:
   ```
   Dashboard → Service → Events → View Build Logs
   ```
3. Kiểm tra PORT environment variable = 10000

---

## Lỗi: Build failed

### Nguyên nhân:
- TypeScript compile error
- Missing dependencies

### Giải pháp:

1. Test build locally:
   ```bash
   cd back_end
   npm install
   npm run build
   ```

2. Fix lỗi compile nếu có

3. Push code mới:
   ```bash
   git add .
   git commit -m "Fix build errors"
   git push
   ```

---

## Lỗi: Redis connection failed

### Không sao cả!
App đã được config để chạy mà không cần Redis. Redis chỉ dùng cho cache, không bắt buộc.

Nếu muốn dùng Redis:
1. Vào Dashboard → New → Redis
2. Copy REDIS_URL
3. Thêm vào Service Environment Variables

---

## Lỗi: Migration failed

### Giải pháp:

1. Vào Service → Shell
2. Chạy migration thủ công:
   ```bash
   npm run migration:run
   ```

3. Nếu lỗi "relation already exists":
   ```bash
   # Bỏ qua, database đã có tables rồi
   ```

4. Seed data:
   ```bash
   npm run seed
   npm run seed:tasks
   ```

---

## Kiểm tra service đang chạy

### Test health check:
```bash
curl https://your-service.onrender.com/api/health
```

Response mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2026-03-02T...",
  "database": "connected",
  "redis": "not configured"
}
```

### Test login:
```bash
curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"1"}'
```

---

## Free Plan Sleep Issue

Service sleep sau 15 phút không dùng. Request đầu tiên sẽ mất 30-60s.

### Giải pháp:

#### Option 1: Ping service định kỳ
Dùng cron-job.org hoặc UptimeRobot để ping mỗi 10 phút:
```
https://your-service.onrender.com/api/health
```

#### Option 2: Upgrade plan
Starter plan ($7/tháng) không bị sleep.

---

## Xem Logs

```
Dashboard → Service → Logs
```

Filter logs:
- All logs: Tất cả
- Build: Logs khi build
- Deploy: Logs khi deploy
- Runtime: Logs khi chạy

---

## Contact Support

Nếu vẫn gặp vấn đề:
1. Vào Dashboard → Service → Support
2. Hoặc: https://render.com/docs
3. Community: https://community.render.com
