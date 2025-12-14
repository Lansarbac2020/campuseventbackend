# Campus Event Management Platform - Quick Start Guide

## 🚀 Quick Start (Using Docker - Recommended)

The easiest way to run the backend is using Docker Compose, which sets up both the database and API automatically.

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Check if it's running**
   ```bash
   curl http://localhost:5000/health
   ```

4. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

5. **Stop the application**
   ```bash
   docker-compose down
   ```

That's it! The API is now running on `http://localhost:5000`

---

## 💻 Manual Setup (Without Docker)

If you prefer to run without Docker:

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database**
   
   Create a database named `campus_events`:
   ```sql
   CREATE DATABASE campus_events;
   ```

3. **Configure environment variables**
   
   Update `.env` file with your database credentials:
   ```
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/campus_events?schema=public"
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Seed the database** (creates sample users and events)
   ```bash
   npm run prisma:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

---

## 🧪 Testing the API

### Using the default credentials (after seeding):

**Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.edu","password":"admin123"}'
```

**Student Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@campus.edu","password":"student123"}'
```

**Organizer Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tech.club@campus.edu","password":"organizer123"}'
```

### Get all events:
```bash
curl http://localhost:5000/api/events
```

---

## 📊 Database Management

### View database in Prisma Studio:
```bash
npm run prisma:studio
```

This opens a visual database editor at `http://localhost:5555`

### Reset database (WARNING: Deletes all data):
```bash
npx prisma migrate reset
```

---

## 🔧 Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with sample data |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.ts        # Main application
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Sample data
├── uploads/             # Uploaded event images
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── package.json         # Dependencies
```

---

## 🌐 API Documentation

Full API documentation is available in the main [README.md](README.md)

### Key Endpoints:

- **Auth**: `/api/auth/*`
- **Events**: `/api/events/*`
- **Registrations**: `/api/registrations/*`
- **Admin**: `/api/admin/*`

---

## ❓ Troubleshooting

### Port 5000 already in use
Change the port in `.env`:
```
PORT=3000
```

### Database connection error
1. Make sure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Verify database credentials

### Prisma Client not generated
Run:
```bash
npm run prisma:generate
```

### Docker container won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild containers
docker-compose down
docker-compose up --build
```

---

## 🎯 Next Steps

1. ✅ Backend is running
2. 📱 Build the frontend (React + Vite + TypeScript)
3. ☁️ Deploy to cloud platform (AWS/GCP/Azure)
4. 📝 Create project documentation
5. 🎥 Record video presentation

---

## 📞 Support

For issues or questions, check the main [README.md](README.md) for detailed documentation.
