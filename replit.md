# JobTracker

A Kanban-style job search tracker built with React, Express, and PostgreSQL. Prospects are organized into columns by pipeline status and can be created, edited, and deleted through a clean card-based interface.

## Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, shadcn/ui, TanStack React Query, wouter
- **Backend**: Express.js (TypeScript), Drizzle ORM, node-postgres
- **Database**: PostgreSQL

## File Structure

```
shared/schema.ts              - Database table definitions (prospects + contacts), Zod validation, TypeScript types
server/
  index.ts                    - Express app bootstrap, middleware, server start
  db.ts                       - PostgreSQL connection pool (Drizzle)
  routes.ts                   - API route handlers for prospects and contacts
  storage.ts                  - Storage interface + DatabaseStorage class
  prospect-helpers.ts         - Pure helper functions (validateProspect, validateContact, etc.)
  __tests__/                  - Jest tests for validation
client/src/
  App.tsx                     - Root component, routing, providers
  pages/home.tsx              - Kanban board with 7 status columns + per-column interest level filter
  components/
    prospect-card.tsx         - Card component with edit/delete actions, contact count display
    add-prospect-form.tsx     - Dialog form for creating prospects
    edit-prospect-form.tsx    - Dialog form for editing prospects + contacts section
    contacts-section.tsx      - Contacts list with add/edit/delete, type filtering
    ui/                       - shadcn/ui primitives
```

## Database

Two tables:
- `prospects`: id, company_name, role_title, job_url, status, interest_level, notes, salary, created_at
- `contacts`: id, prospect_id, name, contact_type, email, title, notes, created_at

- **Statuses**: Bookmarked, Applied, Phone Screen, Interviewing, Offer, Rejected, Withdrawn
- **Interest levels**: High, Medium, Low
- **Contact types**: Recruiter, Current Employee, Other
- **Salary**: Optional integer field, displayed as formatted USD currency on cards

## API

- `GET /api/prospects` - list all, ordered by created_at DESC
- `POST /api/prospects` - create (validated with Zod)
- `PATCH /api/prospects/:id` - partial update with field validation
- `DELETE /api/prospects/:id` - delete (cascades to contacts)
- `GET /api/prospects/:prospectId/contacts` - list contacts for a prospect
- `POST /api/prospects/:prospectId/contacts` - create contact for a prospect
- `PATCH /api/contacts/:id` - update a contact
- `DELETE /api/contacts/:id` - delete a contact

## Running

- `npm run dev` starts the full app (Express + Vite)
- `npm run db:push` syncs schema to database
- `npm test` runs Jest validation tests
