# TaskFlow AI - Backend API

Backend API cho ứng dụng quản lý công việc thông minh TaskFlow AI.

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL (Database)
- Redis (Cache & Session)
- TypeORM (ORM)
- JWT (Authentication)
- Socket.io (Real-time)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Copy file .env
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

## Chạy ứng dụng

```bash
# Development mode
npm run dev

# Build
npm run build

# Production mode
npm start

# Run tests
npm test
```

## Cấu trúc thư mục

```
back_end/
├── src/
│   ├── config/           # Database, Redis config
│   ├── controllers/      # API controllers
│   ├── middlewares/      # Auth, validation, error handling
│   ├── routes/           # API routes
│   ├── validators/       # Request validation schemas
│   ├── utils/            # Helper functions
│   └── app.ts            # Express app entry point
├── tests/                # Test files
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Tasks
- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Sprints
- GET /api/sprints
- POST /api/sprints
- GET /api/sprints/:id

### Teams
- GET /api/teams
- POST /api/teams
- GET /api/teams/:id/members

Xem chi tiết tại `BACKEND_RSR.md`

## Các bước tiếp theo

1. Setup PostgreSQL database
2. Implement models với TypeORM
3. Implement authentication logic
4. Implement business logic cho từng module
5. Viết tests
6. Setup Docker & CI/CD
