# Fastify Backend API with Drizzle ORM

A robust, type-safe RESTful API built with Fastify, Drizzle ORM, PostgreSQL, and TypeScript following MVC architecture for user management, activity logging, and predictions.

## 🚀 Features

- ✅ **MVC Architecture** - Clean separation of concerns (Model-View-Controller)
- ✅ **Drizzle ORM** - Type-safe database queries with excellent TypeScript support
- ✅ **TypeScript** - Full type safety across the entire application
- ✅ **Secure Authentication** - Bcrypt password hashing with salt + JWT tokens
- ✅ **PostgreSQL** - Robust relational database
- ✅ **Request Validation** - JSON Schema validation on all endpoints
- ✅ **Role-Based Access Control** - Admin/Viewer roles with middleware protection
- ✅ **Error Handling** - Global error middleware with detailed logging
- ✅ **Activity Logging** - Complete audit trail system
- ✅ **Prediction API** - Date-based environmental predictions

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd fastify-drizzle-backend

# Install dependencies with pnpm
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
MODE=development
PORT=3000
HOST=0.0.0.0

# Database (PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE your_database;
```

### 2. Generate Drizzle Schema

Drizzle will generate SQL migrations from the schema:

```bash
# Generate migrations from schema
pnpm db:generate
```

### 3. Run Migrations

```bash
# Apply migrations to database
pnpm db:migrate
```

### 4. Insert Default Roles

```sql
INSERT INTO user_role (name) VALUES 
  ('admin'), 
  ('viewer'), 
  ('operator');
```

### 5. Drizzle Studio (Optional)

Drizzle Studio provides a GUI to view and edit your database:

```bash
# Launch Drizzle Studio
pnpm db:studio
```

Access at: `https://local.drizzle.studio`

## 🏃 Running the Application

```bash
# Development mode with auto-reload (using tsx)
pnpm dev

# Build TypeScript to JavaScript
pnpm build

# Production mode
pnpm start
```

The server will start at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Auth Endpoints

### POST /api/auth/login
Login with username and password

**Request Body:**
```json
{
  "name": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "john_doe",
      "photo": null,
      "roleId": 2,
      "roleName": "viewer",
      "createdAt": "2025-10-29T10:00:00.000Z",
      "updatedAt": "2025-10-29T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👤 User Endpoints

### POST /api/users
Create a new user (public endpoint, assigns viewer role by default)

**Request Body:**
```json
{
  "name": "john_doe",
  "password": "password123",
  "photo": "base64_encoded_image_optional"
}
```

### GET /api/users
Get all users (requires authentication)

### GET /api/users/:id
Get user by ID (requires authentication)

### PUT /api/users/:id
Update user details (requires authentication)

**Request Body:**
```json
{
  "name": "jane_doe",
  "password": "newpassword123",
  "photo": "base64_encoded_image",
  "role_id": 1
}
```

### DELETE /api/users/:id
Delete user (requires authentication and admin role)

---

## 📋 Activity Log Endpoints

### POST /api/activity-logs
Create activity log (requires authentication)

**Request Body:**
```json
{
  "type": "face_detection",
  "data": "Detection data in JSON format",
  "datetime": "2025-10-29T10:30:00Z",
  "status": "verified",
  "identity": "john_doe",
  "confidence": 0.95,
  "distance": 0.3,
  "filePath": "/uploads/detection_123.jpg",
  "userId": 1,
  "cameraId": 5
}
```

### GET /api/activity-logs
Get activity logs with optional filters (requires authentication)

**Query Parameters:**
- `status`: verified | no_face | unknown
- `user_id`: Filter by user ID
- `camera_id`: Filter by camera ID
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `limit`: Number of records (default: 100, max: 1000)
- `offset`: Offset for pagination (default: 0)

**Example:**
```
GET /api/activity-logs?status=verified&limit=50&offset=0
```

---

## 📊 Prediction Endpoints

### GET /api/predictions
Get prediction by datetime (requires authentication)

**Query Parameters:**
- `datetime` (required): Date in ISO format
- `room_id` (optional): Room ID

**Example:**
```
GET /api/predictions?datetime=2025-10-29T10:00:00Z&room_id=1
```

### GET /api/predictions/range
Get predictions by date range (requires authentication)

**Query Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `room_id`: Room ID (optional)

### POST /api/predictions
Create prediction (requires authentication)

**Request Body:**
```json
{
  "datetime": "2025-10-29T10:00:00Z",
  "temperaturePrediction": 22.5,
  "maxTemperaturePrediction": 25.0,
  "minTemperaturePrediction": 20.0,
  "maxHumidityPrediction": 70.0,
  "minHumidityPrediction": 50.0
}
```

---

## 🔒 Security Features

1. **Password Encryption**: Bcrypt with configurable salt rounds
2. **JWT Authentication**: Secure token-based auth with expiration
3. **Role-Based Access**: Admin-only endpoints for sensitive operations
4. **Input Validation**: JSON Schema validation on all inputs
5. **SQL Injection Protection**: Drizzle ORM's parameterized queries
6. **Type Safety**: Full TypeScript coverage prevents runtime errors

## 📁 Project Structure

```
src/
├── config/          # Environment and database configuration
├── db/              # Drizzle schema and database instance
│   ├── schema.ts    # Database schema definitions
│   └── index.ts     # Database connection
├── models/          # Data access layer (Drizzle queries)
├── services/        # Business logic layer
├── controllers/     # Request/response handlers
├── routes/          # API endpoint definitions
├── middleware/      # Authentication and error handling
├── utils/           # Helper functions (password, responses)
└── types/           # TypeScript type definitions
```

## 🎯 Drizzle ORM Benefits

### Type Safety
```typescript
// Fully typed queries
const users = await db.select().from(user).where(eq(user.id, 1));
// users is automatically typed as User[]
```

### Relational Queries
```typescript
// Join tables with type safety
const result = await db
  .select({
    userId: user.id,
    userName: user.name,
    roleName: userRole.name,
  })
  .from(user)
  .leftJoin(userRole, eq(user.roleId, userRole.id));
```

### Schema Inference
```typescript
// Automatically infer types from schema
type User = typeof user.$inferSelect;
type NewUser = typeof user.$inferInsert;
```

## 🛠️ Drizzle Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly to database (dev only)
pnpm db:push

# Launch Drizzle Studio GUI
pnpm db:studio
```

## 🧪 Testing Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"john_doe","password":"password123"}'
```

**Create User:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"jane_doe","password":"password123"}'
```

**Get Users (with auth):**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 Migration Workflow

When you modify the database schema:

1. Update `src/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Review generated SQL in `drizzle/migrations/`
4. Apply migration: `pnpm db:migrate`

## 🚀 Deployment Tips

1. **Environment Variables**: Never commit `.env` file
2. **Build**: Run `pnpm build` before deployment
3. **Database**: Run migrations on production database
4. **JWT Secret**: Use strong, random secret in production
5. **Logging**: Set `MODE=production` for performance
6. **Connection Pooling**: Configure PostgreSQL connection limits

## 📊 Performance Considerations

- **Drizzle ORM** is extremely fast (query builder, not heavy ORM)
- **Connection Pooling** via `postgres` driver
- **Prepared Statements** prevent SQL injection and improve performance
- **Indexed Queries** on foreign keys and frequently queried columns

## 🐛 Debugging

### Database Connection Issues
```bash
# Test database connection
psql postgresql://user:password@localhost:5432/dbname
```

### View Migrations
```bash
ls drizzle/migrations/
```

### Check Logs
```bash
pnpm dev
# Logs show all SQL queries in development mode
```

## 📝 License

MIT

## 👥 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 🔗 Useful Links

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Fastify Documentation](https://www.fastify.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org)