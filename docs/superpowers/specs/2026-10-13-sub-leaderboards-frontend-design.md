# Sub-Leaderboards Frontend Architectural Specification

- **Date:** 2026-10-13
- **Status:** Approved
- **Scope:** Frontend Sub-Leaderboard route and Admin Management UI for `hsgs-hackathon-react-router`

---

## 1. Overview & Motivation

The backend provides scoped sub-leaderboard support (`/api/ranking/sub/:id` and `/api/admin/sub-leaderboards/*`). Sub-leaderboards allow instructors to create custom cohorts (such as recitation classes, study groups, or project teams) within a course.

This frontend specification defines:
1. A public sub-leaderboard route `/ranking/sub/:id` whose UI, ranking tables, and statistics presentation are visually and functionally identical to the main course leaderboard.
2. An administrative management UI at `/admin/sub-leaderboards` enabling instructors to browse sub-leaderboards by course, view member counts, create new sub-leaderboards, update titles and member student lists, and delete them.
3. React Router BFF API endpoints to proxy administrative actions to the backend with authenticated session cookies.

---

## 2. Architecture & Component Structure

### 2.1 Reusable Leaderboard View (`app/components/LeaderboardView.tsx`)

To avoid duplicating 800+ lines of table formatting, sorting, pagination, quote displays, announcements, and recent submission panels, the display logic is refactored into a reusable `LeaderboardView` component:

- **Props**:
  - `title`: `React.ReactNode` — custom header title and navigation (e.g. including back-link to main course).
  - `courseQuote`?: `string | null`
  - `quoteAuthor`?: `string | null`
  - `showDebt`: `boolean`
  - `users`: `ExtendedUser[]` (each item contains user ID, name, shortName, course stats, rating, debt, quizzes completed).
  - `recentSubmissions`: `RecentSubmission[]`
  - `announcements`: `ProcessedAnnouncement[]`
  - `ratingThresholds`?: `RatingThresholds`
  - `customRatingThresholds`?: `boolean`
  - `metaDescription`?: `string`

- **Responsibilities**:
  - Manages client-side sorting by rating, name, quizzes completed, and debt.
  - Manages pagination (50 users per page) and previous/next page indicators.
  - Renders desktop two-column view (rankings table on left, quote/announcements/recent submissions on right) and mobile single-column stacked view.
  - Renders markdown announcements carousel.

### 2.2 Public Sub-Leaderboard Route (`app/routes/ranking.sub.$id.tsx`)

- **Route Registration**: `route("ranking/sub/:id", "routes/ranking.sub.$id.tsx")` in `app/routes.ts`.
- **Loader**:
  1. Reads `params.id` (the CUID of the sub-leaderboard).
  2. Queries `GET ${baseUrl}/api/ranking/sub/${id}`. If status is 404, throws a 404 response with `"Sub-leaderboard not found"`.
  3. Response contains:
     ```typescript
     {
       subLeaderboard: {
         id: string;
         name: string;
         courseId: string;
         courseName: string;
       };
       ranking: LeaderboardUserEntry[];
       recentSubmissions: RecentSubmissionEntry[];
     }
     ```
  4. Fetches course announcements via `GET ${baseUrl}/api/announcements/course/${subLeaderboard.courseId}`. If failed or empty, defaults to empty array. Processes markdown content with `processMarkdownToHtml`.
  5. Extracts `ratingThresholds` from the ranking data course configuration.
  6. Returns `{ users, recentSubmissions, announcements, subLeaderboard, ratingThresholds }`.
- **Title & Header**:
  - Header displays:
    ```tsx
    <h1 className="text-3xl font-bold mb-4 flex items-center flex-wrap gap-2">
      <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
      <span>{subLeaderboard.name}</span>
      <span className="text-muted-foreground font-normal text-xl">
        — <Link to={`/ranking/${courseId}`} className="hover:underline text-primary">{subLeaderboard.courseName}</Link>
      </span>
    </h1>
    ```
- **Meta**:
  - Page title: `${subLeaderboard.name} - ${subLeaderboard.courseName} - Sub-Leaderboard - ${Config.siteDescription}`.

---

## 3. Admin Management UI (`/admin/sub-leaderboards`)

### 3.1 Route & Layout (`app/routes/admin/sub-leaderboards.tsx`)

- **Route Registration**: `route("sub-leaderboards", "routes/admin/sub-leaderboards.tsx")` inside the `admin` layout block in `app/routes.ts`.
- **Sidebar Integration**:
  - Added to `sidebarItems` in `app/routes/admin/layout.tsx`:
    `{ href: "/admin/sub-leaderboards", label: "Sub-Leaderboards", icon: Trophy, exact: false }`.
- **Loader**:
  - Calls `GET /api/courses` (or `/api/admin/courses`) forwarding authentication cookies to retrieve all active courses.
  - Returns list of courses: `{ courses: Course[] }`.
- **Page Layout**:
  - **Header**: Title ("Sub-Leaderboards"), description, and a "New Sub-Leaderboard" action button (`Plus` icon).
  - **Course Filter**: `CourseSelector` combobox defaulting to the first course.
  - **Sub-Leaderboards Table**:
    - Columns: **Sub-Leaderboard Name**, **Course**, **Members**, **Created At**, **Actions**.
    - Empty state: Clean card prompt ("No sub-leaderboards found for this course. Click 'New Sub-Leaderboard' to create one.").
    - Row Actions:
      - **View**: External link icon navigating to `/ranking/sub/${id}` in a new or current tab.
      - **Edit**: Edit icon opening the edit modal dialog.
      - **Delete**: Trash icon opening confirmation dialog.

### 3.2 Modal Dialog (`app/components/SubLeaderboardDialog.tsx`)

- **State Modes**: `"create"` or `"edit"`.
- **Fields**:
  1. **Name**: Text input for the title (required, e.g. "Class 10A1").
  2. **Candidate Enrolled Students**:
     - Fetched via course ranking or admin list for `selectedCourseId` to obtain `{ studentId, name, shortName }`.
  3. **Interactive Student Multi-Select**:
     - Search input to filter candidates by name or student ID.
     - Clickable badges/chips for already selected members with `x` to remove.
  4. **Bulk Student IDs Input**:
     - Collapsible textarea allowing pasting student IDs separated by commas, spaces, or newlines.
     - Automatically parses IDs, normalizes them, and merges them with the selected members state.
- **Save Action**:
  - Calls `POST /api/admin/sub-leaderboards` (for create) or `PUT /api/admin/sub-leaderboards/${id}` (for edit).
  - Handles errors with clear validation messages.
  - Triggers table refresh and dialog close on success.

### 3.3 Deletion Flow

- Uses `SaveDialog` component:
  - Title: "Delete Sub-Leaderboard"
  - Description: "Are you sure you want to delete this sub-leaderboard? This action cannot be undone."
  - Calls `DELETE /api/admin/sub-leaderboards/${id}`.

---

## 4. BFF API Proxy Endpoints

The React Router app provides BFF endpoints under `/api/admin/sub-leaderboards` that forward requests and cookies to the backend:

1. **`app/routes/api.admin.sub-leaderboards.ts`**:
   - `action` (`POST`): Forwards body `{ courseId, name, studentIds }` to backend `POST /api/admin/sub-leaderboards`.
2. **`app/routes/api.admin.sub-leaderboards.course.$randomizedCourseId.ts`**:
   - `loader` (`GET`): Forwards request to backend `GET /api/admin/sub-leaderboards/course/${randomizedCourseId}`.
3. **`app/routes/api.admin.sub-leaderboards.$id.ts`**:
   - `loader` (`GET`): Forwards request to backend `GET /api/admin/sub-leaderboards/${id}` to fetch metadata and member details.
   - `action` (`PUT`): Forwards update body `{ name, studentIds }` to backend `PUT /api/admin/sub-leaderboards/${id}`.
   - `action` (`DELETE`): Forwards deletion to backend `DELETE /api/admin/sub-leaderboards/${id}`.

---

## 5. Backward Compatibility & Verification

1. **Main Leaderboard Route**:
   - `/ranking/:randomizedCourseId` continues to function with identical UI, verified by refactoring to use the shared `LeaderboardView`.
2. **Type Safety & Build**:
   - Build and typecheck pass cleanly with `bun run typecheck` and `bun run build`.
3. **Admin Authorization**:
   - Unauthenticated or non-admin requests are redirected or rejected with 401/403.
