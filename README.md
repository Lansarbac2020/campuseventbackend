# Campus Event Management Platform - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7)

**A production-ready RESTful API for managing campus events with role-based access control, built with modern technologies and deployed on Render.com**

[Live Demo](https://campuseventbackend.onrender.com) • [API Docs](#api-endpoints) • [Report Issues](https://github.com/Lansarbac2020/campuseventbackend/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## 🎯 Overview

The Campus Event Management Platform Backend is a comprehensive RESTful API that powers a full-featured event management system for university campuses. It provides secure authentication, role-based authorization, event CRUD operations, registration management, and administrative controls.

### Key Highlights

- ✅ **Production-Ready**: Deployed on Render.com with Docker containerization
- ✅ **Type-Safe**: Built with TypeScript for enhanced developer experience
- ✅ **Secure**: JWT authentication with bcrypt password hashing
- ✅ **Scalable**: Containerized architecture ready for horizontal scaling
- ✅ **Modern ORM**: Prisma for type-safe database operations
- ✅ **Cloud-Native**: Optimized for cloud deployment with managed PostgreSQL

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Three user roles: Student, Organizer, Admin
- Secure password hashing with bcrypt
- Protected routes with middleware

### 📅 Event Management
- Create, read, update, delete (CRUD) operations
- Event approval workflow (Pending → Approved/Rejected)
- Image upload support with cloud storage integration
- Category and tag-based organization
- Capacity management and tracking
- Advanced filtering and search

### 🎫 Registration System
- One-click event registration
- QR code identifier generation for tickets
- Registration status tracking (Registered, Cancelled, Attended)
- Duplicate registration prevention
- Capacity validation
- Registration history

### 👨‍💼 Admin Panel
- Event approval/rejection system
- User management (activate/deactivate)
- Dashboard statistics and analytics
- System-wide monitoring
- Bulk operations support

### 📊 Analytics & Reporting
- Real-time event statistics
- User engagement metrics
- Registration trends
- Popular events tracking

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x | JavaScript runtime environment |
| **Express.js** | 4.21.1 | Web application framework |
| **TypeScript** | 5.6.3 | Type-safe JavaScript |
| **PostgreSQL** | 15 | Relational database |
| **Prisma** | 5.22.0 | Next-generation ORM |

### Security & Authentication

| Technology | Version | Purpose |
|------------|---------|---------|
| **jsonwebtoken** | 9.0.2 | JWT token generation/verification |
| **bcryptjs** | 2.4.3 | Password hashing |
| **cors** | 2.8.5 | Cross-origin resource sharing |

### File Handling & Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| **multer** | 1.4.5 | Multipart form data handling |
| **qrcode** | 1.5.4 | QR code generation |
| **date-fns** | 4.1.0 | Date manipulation |

### DevOps & Deployment

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Render.com** | Cloud hosting platform |
| **GitHub** | Version control & CI/CD |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Render.com Platform                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐                 ┌────────▼────────┐
│  Web Service   │                 │   PostgreSQL    │
│   (Backend)    │◄────────────────│   (Database)    │
│                │  Private Network│                 │
│ ┌────────────┐ │                 │ ┌─────────────┐ │
│ │  Docker    │ │                 │ │   Tables    │ │
│ │ Container  │ │                 │ │ - User      │ │
│ │            │ │                 │ │ - Event     │ │
│ │ Express.js │ │                 │ │ - Registr.  │ │
│ │ TypeScript │ │                 │ └─────────────┘ │
│ │ Prisma ORM │ │                 │                 │
│ └────────────┘ │                 │ - Auto Backup   │
│                │                 │ - SSL Required  │
└───────┬────────┘                 └─────────────────┘
        │
        │ HTTPS REST API
        │
┌───────▼──────────────────┐
│   Clients (Frontend)     │
│  - Web Application       │
│  - Mobile Apps           │
│  - Third-party Services  │
└──────────────────────────┘
```

### Request Flow

```
Client Request
    │
    ├─► CORS Middleware
    ├─► JSON Body Parser
    ├─► Authentication Middleware (JWT)
    ├─► Authorization Middleware (RBAC)
    │
    ├─► Route Handler
    │   ├─► Input Validation
    │   ├─► Business Logic
    │   └─► Database Operations (Prisma)
    │
    └─► Response (JSON)
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Lansarbac2020/campuseventbackend.git
cd campuseventbackend
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js and middleware
- TypeScript and type definitions
- Prisma ORM
- Authentication libraries
- Utilities

#### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/campus_events?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Cloud Storage (Optional - for production)
# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Google Cloud Storage
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
GCS_KEYFILE_PATH=./path-to-keyfile.json
```

#### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data (optional)
npm run prisma:seed
```

The seed command creates:
- 1 Admin user
- 1 Organizer user
- 1 Student user
- 5 Sample events

#### 5. Start the Server

**Development Mode** (with hot reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

#### 6. Verify Installation

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Campus Event Platform API is running"
}
```

---

## 📚 API Documentation

### Base URL

- **Local**: `http://localhost:5000/api`
- **Production**: `https://campuseventbackend.onrender.com/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/profile` | Get user profile | Yes |

**Example: Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@campus.edu",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT",
  "studentId": "2021001"
}
```

**Example: Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@campus.edu",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "student@campus.edu",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

#### 📅 Events (`/api/events`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all events | No | All |
| GET | `/:id` | Get event by ID | No | All |
| POST | `/` | Create event | Yes | Organizer, Admin |
| PUT | `/:id` | Update event | Yes | Creator, Admin |
| DELETE | `/:id` | Delete event | Yes | Creator, Admin |
| GET | `/my/events` | Get my events | Yes | Organizer, Admin |

**Query Parameters for GET /events:**
- `status` - Filter by status (PENDING, APPROVED, REJECTED)
- `category` - Filter by category
- `search` - Search in title and description
- `upcoming` - Only upcoming events (true/false)

**Example: Create Event**
```bash
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference for students",
  "location": "Main Auditorium",
  "startDate": "2025-03-15T10:00:00Z",
  "endDate": "2025-03-15T18:00:00Z",
  "maxAttendees": 200,
  "category": "Technology",
  "tags": ["tech", "conference", "networking"]
}
```

#### 🎫 Registrations (`/api/registrations`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/events/:eventId/register` | Register for event | Yes | Student |
| DELETE | `/events/:eventId/cancel` | Cancel registration | Yes | Student |
| GET | `/my` | Get my registrations | Yes | Student |
| GET | `/:id` | Get registration details | Yes | Owner, Admin |
| GET | `/events/:eventId/attendees` | Get event attendees | Yes | Creator, Admin |

**Example: Register for Event**
```bash
POST /api/registrations/events/:eventId/register
Authorization: Bearer <token>

Response:
{
  "message": "Successfully registered for event",
  "registration": {
    "id": "uuid",
    "qrCode": "REG-uuid",
    "status": "REGISTERED",
    "event": {...}
  }
}
```

#### 👨‍💼 Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/events/pending` | Get pending events | Yes | Admin |
| PUT | `/events/:id/approve` | Approve event | Yes | Admin |
| PUT | `/events/:id/reject` | Reject event | Yes | Admin |
| GET | `/users` | Get all users | Yes | Admin |
| PUT | `/users/:id/toggle-status` | Toggle user status | Yes | Admin |
| GET | `/dashboard/stats` | Get statistics | Yes | Admin |

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id: UUID (PK)       │
│ email: String       │
│ password: String    │
│ name: String        │
│ role: Enum          │
│ studentId: String?  │
│ clubName: String?   │
│ isActive: Boolean   │
│ createdAt: DateTime │
│ updatedAt: DateTime │
└──────────┬──────────┘
           │
           │ 1:N (eventsCreated)
           │
┌──────────▼──────────┐         ┌─────────────────────┐
│       Event         │         │    Registration     │
├─────────────────────┤         ├─────────────────────┤
│ id: UUID (PK)       │◄────────┤ id: UUID (PK)       │
│ title: String       │   N:1   │ userId: UUID (FK)   │
│ description: String │         │ eventId: UUID (FK)  │
│ imageUrl: String?   │         │ status: Enum        │
│ location: String    │         │ qrCode: String      │
│ startDate: DateTime │         │ registeredAt: DT    │
│ endDate: DateTime   │         │ cancelledAt: DT?    │
│ maxAttendees: Int   │         │ attendedAt: DT?     │
│ currentAttendees: Int│        └─────────────────────┘
│ status: Enum        │
│ category: String    │
│ tags: String[]      │
│ createdById: UUID   │
│ createdAt: DateTime │
│ updatedAt: DateTime │
└─────────────────────┘
```

### Enums

**UserRole**
- `STUDENT` - Can browse and register for events
- `ORGANIZER` - Can create and manage events
- `ADMIN` - Full system access

**EventStatus**
- `PENDING` - Awaiting admin approval
- `APPROVED` - Approved and visible
- `REJECTED` - Rejected by admin
- `CANCELLED` - Cancelled by organizer

**RegistrationStatus**
- `REGISTERED` - Active registration
- `CANCELLED` - Cancelled by student
- `ATTENDED` - Student attended event

---

## 🐳 Docker Deployment

### Multi-Stage Dockerfile

The project includes an optimized multi-stage Dockerfile for production deployment:

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p uploads
ENV PORT=10000
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:10000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["npm", "start"]
```

### Build and Run with Docker

```bash
# Build the image
docker build -t campus-event-backend .

# Run the container
docker run -p 5000:10000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV="production" \
  campus-event-backend
```

### Docker Compose (Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## ☁️ Cloud Deployment

### Render.com Deployment (Recommended)

This project is optimized for deployment on **Render.com** with native Docker support.

#### Why Render.com?

✅ **No Credit Card Required** - Truly free tier  
✅ **Native Docker Support** - Uses your Dockerfile  
✅ **Auto-Deploy** - GitHub integration  
✅ **Managed PostgreSQL** - 90 days free  
✅ **HTTPS Included** - Automatic SSL certificates  
✅ **Easy Setup** - Deploy in minutes  

#### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: campuseventbackend
     - **Region**: Oregon (US West)
     - **Branch**: main
     - **Runtime**: Docker
     - **Plan**: Free

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<from Render PostgreSQL>
   JWT_SECRET=<strong-secret-key>
   JWT_EXPIRES_IN=7d
   UPLOAD_DIR=/var/data/uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: campus-events-db
   - Plan: Free (90 days)
   - Copy Internal Database URL to `DATABASE_URL`

5. **Run Migrations**
   - Open Shell in Render dashboard
   - Run:
     ```bash
     npx prisma generate
     npx prisma migrate deploy
     npx prisma db seed
     ```

6. **Access Your API**
   - URL: `https://campuseventbackend.onrender.com`
   - Health check: `https://campuseventbackend.onrender.com/health`

#### Production URL

🌐 **Live API**: https://campuseventbackend.onrender.com

### Alternative Cloud Platforms

<details>
<summary><b>AWS Deployment</b></summary>

**Using AWS Elastic Beanstalk:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker campus-event-backend

# Create environment
eb create production

# Deploy
eb deploy
```

**Using AWS ECS:**
- Build and push Docker image to ECR
- Create ECS task definition
- Deploy to ECS Fargate
</details>

<details>
<summary><b>Google Cloud Platform</b></summary>

**Using Cloud Run:**
```bash
# Build and deploy
gcloud run deploy campus-event-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```
</details>

<details>
<summary><b>DigitalOcean App Platform</b></summary>

- Connect GitHub repository
- Select Dockerfile
- Configure environment variables
- Deploy
</details>

---

## 📁 Project Structure

```
campuseventbackend/
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── seed.ts                 # Database seeder
│   └── migrations/             # Migration history
├── src/
│   ├── config/
│   │   └── index.ts            # Configuration management
│   ├── controllers/
│   │   ├── authController.ts   # Authentication logic
│   │   ├── eventController.ts  # Event CRUD operations
│   │   ├── registrationController.ts  # Registration logic
│   │   └── adminController.ts  # Admin operations
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication & RBAC
│   │   ├── errorHandler.ts     # Global error handling
│   │   └── upload.ts           # File upload middleware
│   ├── routes/
│   │   ├── authRoutes.ts       # Auth endpoints
│   │   ├── eventRoutes.ts      # Event endpoints
│   │   ├── registrationRoutes.ts  # Registration endpoints
│   │   └── adminRoutes.ts      # Admin endpoints
│   ├── utils/
│   │   └── qrcode.ts           # QR code utilities
│   └── server.ts               # Express app setup
├── uploads/                    # Uploaded files (local dev)
├── .dockerignore               # Docker ignore rules
├── .env                        # Environment variables (local)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── Dockerfile                  # Docker build instructions
├── docker-compose.yml          # Docker Compose config
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Start dev server with hot reload |
| **Build** | `npm run build` | Compile TypeScript to JavaScript |
| **Start** | `npm start` | Start production server |
| **Prisma Generate** | `npm run prisma:generate` | Generate Prisma Client |
| **Migrate** | `npm run prisma:migrate` | Run database migrations |
| **Seed** | `npm run prisma:seed` | Seed database with sample data |
| **Studio** | `npm run prisma:studio` | Open Prisma Studio (DB GUI) |
| **Docker Build** | `docker build -t backend .` | Build Docker image |
| **Docker Run** | `docker run -p 5000:10000 backend` | Run Docker container |

---

## 🔑 Default Credentials

After running `npm run prisma:seed`, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@campus.edu | admin123 |
| **Organizer** | tech.club@campus.edu | organizer123 |
| **Student** | john.doe@campus.edu | student123 |

⚠️ **Important**: Change these credentials in production!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Bacoro dit Elhadji Lansar**
- GitHub: [@Lansarbac2020](https://github.com/Lansarbac2020)

---

## 🙏 Acknowledgments

- Built for ISE 465 - Cloud Computing Course
- Deployed on [Render.com](https://render.com)
- Database hosted on Render PostgreSQL
- Inspired by modern event management systems

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for Campus Event Management

</div>
