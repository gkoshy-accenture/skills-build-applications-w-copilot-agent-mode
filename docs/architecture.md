# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep each route component responsible for reading a single API contract, using the shared client in `octofit-tracker/frontend/src/api/client.ts` so the UI stays consistent and testable; render loading, empty, and accessible error states instead of placeholder text.
- Logic tier decision: Implement the Express API as thin route handlers over a service layer in `octofit-tracker/backend/src/services`, with explicit validation for malformed IDs, missing required fields, and missing-user or missing-team conditions before any database writes.
- Data tier decision: Define all Mongoose schemas with the required validation rules in `octofit-tracker/backend/src/models`, and keep the seed process idempotent so representative users, teams, activities, and workouts can be recreated without duplicating existing records.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`, verify both references exist, reject invalid IDs with a deliberate 4xx, and compute a `points` value plus `occurredAt` before saving the record.
- Team management approach: Require a team `name` and `mascot`, default `members` to an empty array, and preserve member IDs when teams are created or listed so the UI can display team composition correctly.
- Leaderboard approach: Aggregate points per team from activities, sort descending by total points, and assign a 1-based `rank` to each row while returning the shape expected by the frontend (`teamName`, `totalPoints`, `rank`).
- Workout suggestions approach: Match the requested user by email, inspect recent activity patterns or fitness goals, select a workout whose `focus` matches the pattern, and attach a human-readable `reason` explaining why the recommendation fits.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Failure means the Mongoose schemas do not yet enforce required fields or the seed script is not idempotently creating the expected representative fixtures.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Failure means the Express routes or service logic are still incomplete: invalid payloads are returning the wrong status, leaderboard aggregation is empty, or workout suggestions are not matching recent activity.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Failure means the UI is still showing placeholder “Implementation pending” content instead of loading/empty/error states connected to the shared client and API data.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Failure means the TypeScript API or model layer does not compile cleanly and should be fixed before moving on to frontend verification.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Failure means the React app is not compiling under Vite, usually because the API usage, route rendering, or shared client contract is still inconsistent.
