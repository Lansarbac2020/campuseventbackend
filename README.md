# Campus Event Management Platform - Backend

A robust Node.js + Express + TypeScript backend API for managing campus events with role-based access control.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access (Student, Organizer, Admin)
- 📅 **Event Management** - Create, update, delete, and browse events
- 🎫 **Registration System** - Students can register for events with QR code tickets
- 👨‍💼 **Admin Panel** - Event approval system and user management
- 📊 **Dashboard Statistics** - Real-time analytics for admins
- 🖼️ **Image Upload** - Event image uploads with cloud storage support
- 🔍 **Search & Filter** - Advanced event filtering and search capabilities

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **QR Codes**: qrcode library

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/campus_events?schema=public"
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Seed the database** (optional - creates sample data)
   ```bash
   npm run prisma:seed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (protected)

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Organizer/Admin only)
- `PUT /api/events/:id` - Update event (Organizer/Admin only)
- `DELETE /api/events/:id` - Delete event (Organizer/Admin only)
- `GET /api/events/my/events` - Get my created events (Organizer/Admin only)

### Registrations
- `POST /api/registrations/events/:eventId/register` - Register for event (Student only)
- `DELETE /api/registrations/events/:eventId/cancel` - Cancel registration (Student only)
- `GET /api/registrations/my` - Get my registrations (Student only)
- `GET /api/registrations/:id` - Get registration details
- `GET /api/registrations/events/:eventId/attendees` - Get event attendees (Organizer/Admin only)

### Admin
- `GET /api/admin/events/pending` - Get pending events
- `PUT /api/admin/events/:id/approve` - Approve event
- `PUT /api/admin/events/:id/reject` - Reject event
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-status` - Activate/deactivate user
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Database Schema

### User Roles
- `STUDENT` - Can browse and register for events
- `ORGANIZER` - Can create and manage events
- `ADMIN` - Full access to all features

### Event Status
- `PENDING` - Awaiting admin approval
- `APPROVED` - Approved and visible to students
- `REJECTED` - Rejected by admin
- `CANCELLED` - Cancelled by organizer

## Default Credentials (After Seeding)

- **Admin**: `admin@campus.edu` / `admin123`
- **Organizer**: `tech.club@campus.edu` / `organizer123`
- **Student**: `john.doe@campus.edu` / `student123`

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeder
├── src/
│   ├── config/
│   │   └── index.ts       # Configuration
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── eventController.ts
│   │   ├── registrationController.ts
│   │   └── adminController.ts
│   ├── middleware/
│   │   ├── auth.ts        # Authentication & authorization
│   │   ├── errorHandler.ts
│   │   └── upload.ts      # File upload
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── eventRoutes.ts
│   │   ├── registrationRoutes.ts
│   │   └── adminRoutes.ts
│   ├── utils/
│   │   └── qrcode.ts      # QR code generation
│   └── server.ts          # Main application
├── uploads/               # Uploaded files
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json
└── tsconfig.json
```

## Cloud Deployment

This backend is ready for deployment to:
- AWS (EC2, Elastic Beanstalk, or ECS)
- Google Cloud Platform (Compute Engine or Cloud Run)
- Azure (App Service or Container Instances)
- DigitalOcean (Droplets or App Platform)

### Environment Variables for Production

Make sure to set these in your cloud environment:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key
- `NODE_ENV=production`
- `PORT` - Server port (usually provided by cloud platform)

### Cloud Storage Integration

For production, integrate with cloud storage:
- **AWS S3**: Uncomment AWS configuration in `.env`
- **Google Cloud Storage**: Uncomment GCS configuration in `.env`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data


### Docker

# View logs
docker compose -f docker-compose.simple.yml logs -f backend

# Stop container
docker compose -f docker-compose.simple.yml down

# Restart container
docker compose -f docker-compose.simple.yml restart

# View running containers
docker compose -f docker-compose.simple.yml ps

## License

MIT
