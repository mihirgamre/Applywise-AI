# ApplyWise AI

ApplyWise AI is a full-stack portfolio project for CS students applying to internships and new-grad SWE roles. It combines resume management, job tracking, application status workflows, dashboard analytics, and AI-powered resume-to-job fit analysis.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, multer, pdf-parse, mammoth, zod
- AI: OpenAI API when `OPENAI_API_KEY` is configured, deterministic mock analysis otherwise
- Infrastructure: Docker Compose PostgreSQL

## Features

- Register, login, logout, and JWT-protected routes
- User-scoped resumes, jobs, applications, analyses, and activity
- PDF/DOCX upload with text extraction and 5MB limit
- Manual resume creation and editing
- Job CRUD with company, title, location, URL, source, employment type, and description
- Application tracker with status, priority, applied date, deadline, and notes
- AI resume-job analysis with match score, strengths, weaknesses, missing skills, missing keywords, tailored bullets, tailored summary, and interview questions
- Dashboard with application counts, status chart, average match score, recent activity, and top missing skills

## Screenshots

Add screenshots here after running the app:

- Landing page
- Dashboard
- Resume management
- Application tracker
- AI analysis result

## Architecture Overview

The repository is a two-workspace npm monorepo:

```txt
client/  React + Vite UI
server/  Express API + Prisma
```

The React app stores the JWT in local storage and sends it through an Axios interceptor. The Express API validates requests with zod, enforces ownership through `userId` checks, stores structured arrays as PostgreSQL JSON, and records key actions in the `Activity` table.

## Database Schema Summary

- `User`: name, email, password hash, timestamps
- `Resume`: user-owned resume text, original file name, parsed skills
- `Job`: user-owned role data and job description
- `Application`: links a job and optional resume with status, priority, dates, and notes
- `Analysis`: stored AI or mock fit analysis for a resume and job
- `Activity`: recent user activity for the dashboard

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Resumes:

- `POST /api/resumes/upload`
- `POST /api/resumes`
- `GET /api/resumes`
- `GET /api/resumes/:id`
- `PUT /api/resumes/:id`
- `DELETE /api/resumes/:id`

Jobs:

- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`

Applications:

- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`

Analysis:

- `POST /api/analysis`
- `GET /api/analysis/job/:jobId`
- `GET /api/analysis/:id`

Dashboard:

- `GET /api/dashboard/stats`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Generate Prisma client, run migrations, and seed demo data:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
```

5. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/api`

## Deployment

The production server can host the built React app and the API from one Node process.

Build command:

```bash
npm install
npm run build
npm run prisma:deploy
```

Start command:

```bash
npm start
```

Required production environment variables:

- `DATABASE_URL`
- `JWT_SECRET` with at least 32 characters
- `NODE_ENV=production`
- `OPENAI_API_KEY` optional; mock analysis is used when absent
- `OPENAI_MODEL` optional; defaults to `gpt-4o-mini`

For split frontend/backend deployments, set `CLIENT_URL` on the API to the frontend origin. For single-domain deployments, leave `CLIENT_URL` unset.

## Environment Variables

`server/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/applywise_ai?schema=public
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=
OPENAI_MODEL=
PORT=5000
CLIENT_URL=http://localhost:5173
```

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo Login

- Email: `demo@applywise.ai`
- Password: `Password123!`

## Resume Bullet Examples

- Built an AI-powered job application tracker using React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.
- Integrated LLM-powered resume analysis to score job fit, identify missing skills, and generate tailored resume improvements.
- Designed secure REST APIs with JWT authentication, file parsing, user-specific authorization, and structured AI response validation.
- Developed a responsive dashboard with application analytics, match-score tracking, and missing-skill insights.

## Future Improvements

- Add password reset and email verification
- Add pagination and search across resumes, jobs, and applications
- Add screenshot capture for portfolio documentation
- Add unit and integration tests for API ownership checks
- Add CSV export for application tracking
- Add richer skill extraction and keyword normalization
