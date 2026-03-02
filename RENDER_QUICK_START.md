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

1. Vào https://render.com và đăng nhập
2. Click "New" → "Blueprint"
3. Connect GitHub repository
4. Render tự động phát hiện `render.yaml`
5. Thêm Environment Variables:
   - `JWT_SECRET`: paste secret từ bước 1
   - `JWT_REFRESH_SECRET`: paste secret từ bước 1
6. Click "Apply"

Render sẽ tự động:
- Tạo PostgreSQL database
- Deploy API service
- Setup health checks

## Bước 4: Chạy Migrations

Sau khi deploy xong (5-10 phút):

1. Vào Service → Shell tab
2. Chạy:
```bash
npm run migration:run
npm run seed
```

## Bước 5: Test API

URL của bạn: `https://your-service-name.onrender.com`

Test:
```bash
curl https://your-service-name.onrender.com/api/health
```

## Bước 6: Cập nhật Frontend

File: `front_end/lib/config/environment.dart`

```dart
static const String production = 'https://your-service-name.onrender.com/api';
```

Xong! 🎉

---

## Lưu ý Free Plan:
- Service sleep sau 15 phút không dùng
- Request đầu tiên sau sleep mất ~30s
- 750 giờ/tháng miễn phí

## Nếu gặp lỗi:
Xem file `DEPLOY_RENDER.md` để biết chi tiết troubleshooting.
