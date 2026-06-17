# ApplyWise AI

ApplyWise AI is a full-stack SaaS-style portfolio project for computer science students managing internship and new-grad software engineering applications. It combines resume storage, job tracking, application pipeline management, dashboard analytics, file parsing, and AI-assisted resume-to-job fit analysis.

Live app: `https://applywise-ai-u055.onrender.com`

> Render free-tier services may sleep after inactivity, so the first request can take 30-60 seconds.

## Why This Project Matters

Students often track applications in spreadsheets and tailor resumes manually. ApplyWise AI turns that workflow into a production-style web app: users can upload or paste resumes, save job descriptions, track every application stage, and generate structured fit analysis that highlights strengths, weaknesses, missing skills, missing keywords, tailored bullet ideas, and interview questions.

## Demo Login

Seed the database first if the demo account is not available:

```bash
npm run seed
```

Then log in with:

```text
Email: demo@applywise.ai
Password: Password123!
```

## Feature Highlights

- Secure authentication with JWT, bcrypt password hashing, and protected routes.
- User-scoped authorization across resumes, jobs, applications, analyses, and activity.
- Resume upload support for PDF and DOCX files with server-side text extraction.
- Manual resume entry and editing for quick iteration.
- Job tracker with company, title, location, URL, source, employment type, and full job description.
- Application pipeline with statuses for saved, applied, online assessment, interview, offer, rejected, and withdrawn.
- AI analysis workflow with OpenAI API support and deterministic mock fallback when no API key is configured.
- Recruiter-style dashboard with status charts, match-score tracking, active pipeline counts, missing-skill insights, recent applications, and activity history.
- Production-ready deployment path with Render Blueprint, PostgreSQL, Prisma migrations, and environment-based configuration.

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

Backend:

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- JWT
- bcrypt
- multer
- pdf-parse
- mammoth
- zod
- helmet
- express-rate-limit

AI:

- OpenAI API when `OPENAI_API_KEY` is configured
- Mock analysis fallback for free local and hosted demos

Deployment:

- Render web service
- Render PostgreSQL
- Render Blueprint via `render.yaml`
- Docker Compose for local PostgreSQL

## Screenshots

Add screenshots after capturing the deployed app:

- Landing page
- Dashboard
- AI Analysis workflow
- Resume management
- Application tracker

## Architecture

```txt
applywise-ai/
  client/        React, TypeScript, Tailwind, Recharts
  server/        Express, Prisma, auth, uploads, AI analysis
  render.yaml    Render Blueprint for app + PostgreSQL
```

The production server hosts both the API and the built React app:

```txt
Browser
  -> Express static React app
  -> /api/* Express REST routes
  -> Prisma
  -> PostgreSQL
```

Authentication uses JWT bearer tokens. API routes validate request bodies with zod and enforce ownership checks by filtering protected records with `userId`.

## Database Models

- `User`: account identity and password hash.
- `Resume`: parsed or manually entered resume text and extracted skills.
- `Job`: target role details and job description.
- `Application`: status, priority, dates, notes, linked job, and optional resume.
- `Analysis`: structured resume-job fit result.
- `Activity`: dashboard timeline events.

## API Overview

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

## Local Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL:

```bash
docker compose up -d
```

Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Run Prisma and seed data:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
```

Start development servers:

```bash
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000/api
```

## Environment Variables

Server:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/applywise_ai?schema=public
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
PORT=5000
CLIENT_URL=http://localhost:5173
```

Client:

```env
VITE_API_URL=http://localhost:5000/api
```

For a same-domain production deployment, the client defaults to `/api`, so `VITE_API_URL` is not required.

## Deployment

The repository includes a Render Blueprint:

```yaml
render.yaml
```

Render creates:

- Node web service
- PostgreSQL database
- `DATABASE_URL`
- generated `JWT_SECRET`

Production command flow:

```bash
npm install
npm run build
npm run prisma:deploy
npm start
```

On Render free tier, migrations run in the service start command because free web services do not support `preDeployCommand`.

Optional:

```env
OPENAI_API_KEY=your-api-key
```

If omitted, the app uses mock AI analysis so the demo remains free to run.

## Security Notes

- Passwords are hashed with bcrypt.
- JWT tokens protect private API routes.
- Protected resources are scoped by `userId`.
- Request validation uses zod.
- File uploads are limited to 5MB and only accept PDF/DOCX.
- Uploaded files are parsed into text; binaries are not stored.
- Helmet and auth rate limiting are enabled on the Express server.
- Password hashes are never returned from the API.

## Resume Bullet Examples

- Built ApplyWise AI, a full-stack AI-powered job application tracker using React, TypeScript, Node.js, Express, PostgreSQL, Prisma, and Tailwind CSS.
- Implemented secure JWT authentication, bcrypt password hashing, zod validation, protected REST APIs, and user-scoped authorization across resumes, jobs, applications, and AI analyses.
- Integrated PDF/DOCX resume parsing and OpenAI-compatible resume-job fit analysis with mock fallback for cost-free demos.
- Designed a responsive SaaS dashboard with application pipeline analytics, Recharts visualizations, match-score tracking, recent activity, and missing-skill insights.
- Prepared the app for production with Render deployment, PostgreSQL migrations, environment-based configuration, security middleware, and rate limiting.

## Future Improvements

- Add automated tests for auth, ownership checks, and AI response validation.
- Add pagination and search across jobs and applications.
- Add CSV export for application tracking.
- Add email reminders for deadlines and interviews.
- Add richer resume skill extraction and keyword normalization.
- Add route-level code splitting to reduce the production JS bundle size.
