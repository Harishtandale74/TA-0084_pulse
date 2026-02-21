# PULSE - Emergency Healthcare Command Center

A real-time emergency response coordination system built for hospitals, dispatchers, and first responders.

## What is this?

PULSE helps emergency teams coordinate faster. Dispatchers can track ambulances, hospitals can update bed capacity in real-time, and everyone stays on the same page during critical moments.

## Tech Stack

**Backend:** Spring Boot 3.2, MySQL, JWT auth, WebSockets  
**Frontend:** React + Vite, Tailwind CSS, Zustand for state

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+

### Database Setup

Create a MySQL database called `pulse_db`. The tables will be auto-generated on first run.

```sql
CREATE DATABASE pulse_db;
```

### Backend

```bash
cd pulse-backend
mvn spring-boot:run
```

Runs on http://localhost:8080

### Frontend

```bash
cd pulse-frontend
npm install
npm run dev
```

Runs on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user (needs JWT)

### Example: Register a user

```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@hospital.com",
  "password": "securepass123",
  "role": "DISPATCHER",
  "organization": "City General Hospital"
}
```

## User Roles

- DISPATCHER - 911 operators, can assign ambulances
- DOCTOR - Medical staff
- HOSPITAL_ADMIN - Manages hospital capacity
- AMBULANCE_CREW - Paramedics in the field
- FAMILY - Patient family portal access
- ADMIN - Full system access

## Config

Backend config is in `pulse-backend/src/main/resources/application.properties`. You'll need to update the MySQL credentials there.

## Project Structure

```
pulse-backend/
  src/main/java/com/pulse/
    controller/    # REST endpoints
    service/       # Business logic
    repository/    # Database access
    security/      # JWT, auth filters
    config/        # Spring config
    dto/           # Request/response objects

pulse-frontend/
  src/
    components/    # React components
    pages/         # Route pages
    stores/        # Zustand state
    api/           # API client
    hooks/         # Custom hooks
```

## Notes

- JWT tokens expire after 24 hours
- WebSocket endpoint at `/ws` for real-time updates
- CORS is configured for localhost:3000-3002

## License

MIT
