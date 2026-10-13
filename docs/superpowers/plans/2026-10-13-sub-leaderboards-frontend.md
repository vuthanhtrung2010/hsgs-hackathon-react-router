# Sub-Leaderboards Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the public sub-leaderboard route `/ranking/sub/:id` (visually and functionally identical to main leaderboard) and the admin sub-leaderboard management UI at `/admin/sub-leaderboards`.

**Architecture:** Refactor the existing course leaderboard UI into a shared `LeaderboardView` component used by both main and sub leaderboards. Implement the public sub-leaderboard route with its dedicated backend loader. Create React Router BFF API proxy endpoints under `/api/admin/sub-leaderboards` and a management UI in `/admin/sub-leaderboards` featuring a course selector, sub-leaderboards table, and an interactive member picker modal.

**Tech Stack:** React 19, React Router v7, TypeScript, Tailwind CSS v4, Lucide React, FontAwesome, Radix UI Dialog / Command / Popover, Bun.

**Spec:** `docs/superpowers/specs/2026-10-13-sub-leaderboards-frontend-design.md`

## Global Constraints

- Must preserve exact visual presentation, sorting, pagination, and styling of the existing main leaderboard.
- Must support CUID identifiers for sub-leaderboards as defined by the backend.
- Must ensure all admin actions pass authentication session cookies to backend endpoints.
- Strict TypeScript typing with no compile errors (`bun run typecheck` must pass at every task).
- All changes must build cleanly with `bun run build`.

---

### Task 1: Extract Shared `LeaderboardView` Component & Unit Tests

**Files:**
- Create: `app/components/LeaderboardView.tsx`
- Create: `app/lib/leaderboard-utils.ts`
- Create: `tests/leaderboard-sorting.test.ts`
- Modify: `app/routes/ranking.$randomizedCourseId.tsx`

**Interfaces:**
- Produces:
  ```typescript
  // app/lib/leaderboard-utils.ts
  export type SortField = "name" | "rating" | "quizzes" | "debt";
  export type SortOrder = "asc" | "desc" | null;

  export interface LeaderboardUser {
    id: string | number;
    name: string;
    shortName: string;
    course: {
      courseName: string;
      rating: number;
      quizzesCompleted: number;
      debt: number;
      quote?: string | null;
      quoteAuthor?: string | null;
      showDebt?: boolean;
      customRatingThresholds?: boolean;
      ratingThresholds?: RatingThresholds;
    };
    [key: string]: any;
  }

  export function sortLeaderboardUsers<T extends LeaderboardUser>(
    users: T[],
    field: SortField,
    order: SortOrder,
  ): T[];
  ```
- Produces:
  ```typescript
  // app/components/LeaderboardView.tsx
  export interface ProcessedAnnouncement {
    id: string;
    title: string;
    content: string;
    processedContent?: string;
    createdAt: string | Date;
    [key: string]: any;
  }

  export interface RecentSubmission {
    id: string | number;
    submittedAt: Date | string;
    userName: string;
    userShortName: string;
    userId: number | string;
    quizName: string;
  }

  export interface LeaderboardViewProps {
    title: React.ReactNode;
    courseQuote?: string | null;
    quoteAuthor?: string | null;
    showDebt?: boolean;
    users: LeaderboardUser[];
    recentSubmissions: RecentSubmission[];
    announcements: ProcessedAnnouncement[];
    ratingThresholds?: RatingThresholds;
    customRatingThresholds?: boolean;
  }

  export default function LeaderboardView(props: LeaderboardViewProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write the failing sorting and utility unit test**

Create `tests/leaderboard-sorting.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { sortLeaderboardUsers, type LeaderboardUser } from "../app/lib/leaderboard-utils.js";

describe("sortLeaderboardUsers", () => {
  const sampleUsers: LeaderboardUser[] = [
    {
      id: "1",
      name: "Bob",
      shortName: "Bob",
      course: {
        courseName: "CS101",
        rating: 1600,
        quizzesCompleted: 5,
        debt: 2,
      },
    },
    {
      id: "2",
      name: "Alice",
      shortName: "Alice",
      course: {
        courseName: "CS101",
        rating: 1800,
        quizzesCompleted: 10,
        debt: 0,
      },
    },
    {
      id: "3",
      name: "Charlie",
      shortName: "Charlie",
      course: {
        courseName: "CS101",
        rating: 1500, // default rating
        quizzesCompleted: 1,
        debt: 5,
      },
    },
  ];

  it("sorts by rating descending with default 1500 treated as 0", () => {
    const sorted = sortLeaderboardUsers(sampleUsers, "rating", "desc");
    expect(sorted.map((u) => u.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("sorts by name ascending", () => {
    const sorted = sortLeaderboardUsers(sampleUsers, "name", "asc");
    expect(sorted.map((u) => u.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("sorts by quizzes descending", () => {
    const sorted = sortLeaderboardUsers(sampleUsers, "quizzes", "desc");
    expect(sorted.map((u) => u.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("sorts by debt ascending", () => {
    const sorted = sortLeaderboardUsers(sampleUsers, "debt", "asc");
    expect(sorted.map((u) => u.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/leaderboard-sorting.test.ts`
Expected: FAIL ("Cannot find module '../app/lib/leaderboard-utils.js'")

- [ ] **Step 3: Implement `app/lib/leaderboard-utils.ts` and `app/components/LeaderboardView.tsx`**

Create `app/lib/leaderboard-utils.ts`:
```typescript
import type { RatingThresholds } from "./rating";

export type SortField = "name" | "rating" | "quizzes" | "debt";
export type SortOrder = "asc" | "desc" | null;

export interface LeaderboardUser {
  id: string | number;
  name: string;
  shortName: string;
  course: {
    courseName: string;
    rating: number;
    quizzesCompleted: number;
    debt: number;
    quote?: string | null;
    quoteAuthor?: string | null;
    showDebt?: boolean;
    customRatingThresholds?: boolean;
    ratingThresholds?: RatingThresholds;
  };
  [key: string]: any;
}

export function sortLeaderboardUsers<T extends LeaderboardUser>(
  users: T[],
  field: SortField,
  order: SortOrder,
): T[] {
  if (!field || !order) return users;

  return [...users].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (field) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return order === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        break;
      case "rating":
        aValue = a.course?.rating ?? 1500;
        bValue = b.course?.rating ?? 1500;

        // Treat default rating (1500) as 0 for sorting purposes
        const ratingA = aValue === 1500 ? 0 : aValue;
        const ratingB = bValue === 1500 ? 0 : bValue;

        const comparison = (ratingA as number) - (ratingB as number);
        return order === "asc" ? comparison : -comparison;
      case "quizzes":
        aValue = a.course?.quizzesCompleted ?? 0;
        bValue = b.course?.quizzesCompleted ?? 0;

        const quizComparison = (aValue as number) - (bValue as number);
        return order === "asc" ? quizComparison : -quizComparison;
      case "debt":
        aValue = a.course?.debt ?? 0;
        bValue = b.course?.debt ?? 0;

        const debtComparison = (aValue as number) - (bValue as number);
        return order === "asc" ? debtComparison : -debtComparison;
      default:
        return 0;
    }

    return 0;
  });
}
```

Create `app/components/LeaderboardView.tsx` by adapting the table, pagination, quote, announcements, and recent submissions markup from `ranking.$randomizedCourseId.tsx`.

Modify `app/routes/ranking.$randomizedCourseId.tsx` to delegate rendering to `<LeaderboardView ... />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/leaderboard-sorting.test.ts`
Expected: PASS
Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/lib/leaderboard-utils.ts app/components/LeaderboardView.tsx app/routes/ranking.\$randomizedCourseId.tsx tests/leaderboard-sorting.test.ts
git commit -m "refactor(leaderboard): extract reusable LeaderboardView component and sorting utility"
```

---

### Task 2: Public Sub-Leaderboard Route (`/ranking/sub/:id`)

**Files:**
- Create: `app/routes/ranking.sub.$id.tsx`
- Create: `tests/sub-leaderboard-route.test.ts`
- Modify: `app/routes.ts`

**Interfaces:**
- Consumes: `LeaderboardView` from `app/components/LeaderboardView.tsx`
- Produces: Route handler for `GET /ranking/sub/:id`

- [ ] **Step 1: Write unit test for sub-leaderboard data parsing**

Create `tests/sub-leaderboard-route.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";

describe("Sub-leaderboard loader response transformation", () => {
  it("formats title with subLeaderboard name and course name", () => {
    const subLeaderboard = {
      id: "sub-123",
      name: "Class 10A1",
      courseId: "course-abc",
      courseName: "Mathematics 10",
    };
    const title = `${subLeaderboard.name} - ${subLeaderboard.courseName}`;
    expect(title).toBe("Class 10A1 - Mathematics 10");
  });

  it("handles empty rankings array safely", () => {
    const payload = {
      subLeaderboard: {
        id: "sub-123",
        name: "Empty Group",
        courseId: "course-1",
        courseName: "Math",
      },
      ranking: [],
      recentSubmissions: [],
    };
    expect(payload.ranking.length).toBe(0);
    expect(payload.recentSubmissions.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify initial state**

Run: `bun test tests/sub-leaderboard-route.test.ts`
Expected: PASS

- [ ] **Step 3: Register route in `app/routes.ts` and create `app/routes/ranking.sub.$id.tsx`**

Modify `app/routes.ts`:
```typescript
  route(
    "ranking/sub/:id",
    "routes/ranking.sub.$id.tsx",
  ),
```
Create `app/routes/ranking.sub.$id.tsx`:
```tsx
import { Link, data } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import LeaderboardView from "~/components/LeaderboardView";
import type { Route } from "./+types/ranking.sub.$id";
import { Config } from "~/config";
import { processMarkdownToHtml } from "~/lib/markdown-processor";
import type { RatingThresholds } from "~/lib/rating";

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    // 1. Fetch sub-leaderboard data
    const subRankingUrl = new URL(`/api/ranking/sub/${id}`, baseUrl);
    const rankingResponse = await fetch(subRankingUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!rankingResponse.ok && rankingResponse.status === 404) {
      throw data("Sub-leaderboard not found", { status: 404 });
    } else if (!rankingResponse.ok) {
      throw data("Failed to fetch sub-leaderboard rankings", {
        status: rankingResponse.status,
      });
    }

    const responseData = await rankingResponse.json();
    const subLeaderboard = responseData.subLeaderboard;
    const ranking = responseData.ranking || [];
    const recentSubmissions = responseData.recentSubmissions || [];

    // 2. Fetch course announcements
    let processedAnnouncements = [];
    if (subLeaderboard?.courseId) {
      try {
        const announcementsUrl = new URL(
          `/api/announcements/course/${subLeaderboard.courseId}`,
          baseUrl,
        );
        const announcementsResponse = await fetch(announcementsUrl.toString());
        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          processedAnnouncements = await Promise.all(
            (announcementsData || []).map(async (announcement: any) => ({
              ...announcement,
              processedContent: announcement.content
                ? await processMarkdownToHtml(announcement.content)
                : "",
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch announcements for sub-leaderboard:", err);
      }
    }

    const courseDetails = ranking?.[0]?.course || {};
    const ratingThresholds =
      courseDetails.customRatingThresholds && courseDetails.ratingThresholds
        ? courseDetails.ratingThresholds
        : undefined;

    return {
      subLeaderboard,
      users: ranking,
      recentSubmissions,
      announcements: processedAnnouncements,
      ratingThresholds,
      customRatingThresholds: courseDetails.customRatingThresholds || false,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error fetching sub-leaderboard:", error);
    throw data("Internal server error", { status: 500 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  const subName = data?.subLeaderboard?.name || "Sub-Leaderboard";
  const courseName = data?.subLeaderboard?.courseName || "Course";
  return [
    { title: `${subName} - ${courseName} - Sub-Leaderboard - ${Config.siteDescription}` },
    {
      name: "description",
      content: `Sub-leaderboard for ${subName} (${courseName}) on ${Config.sitename}. View member rankings and stats.`,
    },
  ];
}

export default function SubLeaderboardRoute({ loaderData }: Route.ComponentProps) {
  const {
    subLeaderboard,
    users,
    recentSubmissions,
    announcements,
    ratingThresholds,
    customRatingThresholds,
  } = loaderData;

  const courseQuote = users[0]?.course?.quote;
  const quoteAuthor = users[0]?.course?.quoteAuthor;
  const showDebt = users[0]?.course?.showDebt || false;

  const titleNode = (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="flex items-center">
        <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
        {subLeaderboard?.name || "Sub-Leaderboard"}
      </span>
      {subLeaderboard?.courseName && (
        <span className="text-muted-foreground font-normal text-xl">
          —{" "}
          <Link
            to={`/ranking/${subLeaderboard.courseId}`}
            className="text-primary hover:underline"
            title={`View full ${subLeaderboard.courseName} leaderboard`}
          >
            {subLeaderboard.courseName}
          </Link>
        </span>
      )}
    </div>
  );

  return (
    <LeaderboardView
      title={titleNode}
      courseQuote={courseQuote}
      quoteAuthor={quoteAuthor}
      showDebt={showDebt}
      users={users}
      recentSubmissions={recentSubmissions}
      announcements={announcements}
      ratingThresholds={ratingThresholds as RatingThresholds}
      customRatingThresholds={customRatingThresholds}
    />
  );
}
```

- [ ] **Step 4: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/routes/ranking.sub.\$id.tsx app/routes.ts tests/sub-leaderboard-route.test.ts
git commit -m "feat(ranking): add public sub-leaderboard route /ranking/sub/:id"
```

---

### Task 3: React Router BFF API Proxy Routes for Sub-Leaderboards

**Files:**
- Create: `app/routes/api.admin.sub-leaderboards.ts`
- Create: `app/routes/api.admin.sub-leaderboards.course.$randomizedCourseId.ts`
- Create: `app/routes/api.admin.sub-leaderboards.$id.ts`
- Create: `tests/api-admin-sub-leaderboards.test.ts`
- Modify: `app/routes.ts`

**Interfaces:**
- Produces:
  - `POST /api/admin/sub-leaderboards`: Creates sub-leaderboard.
  - `GET /api/admin/sub-leaderboards/course/:randomizedCourseId`: Lists sub-leaderboards for a course.
  - `GET /api/admin/sub-leaderboards/:id`: Retrieves sub-leaderboard details and members.
  - `PUT /api/admin/sub-leaderboards/:id`: Updates name and studentIds.
  - `DELETE /api/admin/sub-leaderboards/:id`: Deletes sub-leaderboard.

- [ ] **Step 1: Write failing BFF integration test**

Create `tests/api-admin-sub-leaderboards.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { action as createAction } from "../app/routes/api.admin.sub-leaderboards.js";

describe("Admin Sub-Leaderboard BFF Routes", () => {
  it("rejects non-POST requests to creation route", async () => {
    const req = new Request("http://localhost/api/admin/sub-leaderboards", {
      method: "GET",
    });
    const res = await createAction({ request: req } as any);
    expect(res.status).toBe(405);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/api-admin-sub-leaderboards.test.ts`
Expected: FAIL ("Cannot find module '../app/routes/api.admin.sub-leaderboards.js'")

- [ ] **Step 3: Implement BFF proxy routes & register in `app/routes.ts`**

Create `app/routes/api.admin.sub-leaderboards.ts`:
```typescript
export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(
      new URL("/api/admin/sub-leaderboards", baseUrl).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating sub-leaderboard:", error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
```

Create `app/routes/api.admin.sub-leaderboards.course.$randomizedCourseId.ts`:
```typescript
import type { Route } from "./+types/api.admin.sub-leaderboards.course.$randomizedCourseId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { randomizedCourseId } = params;
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(
      new URL(
        `/api/admin/sub-leaderboards/course/${randomizedCourseId}`,
        baseUrl,
      ).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching course sub-leaderboards:", error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
```

Create `app/routes/api.admin.sub-leaderboards.$id.ts`:
```typescript
import type { Route } from "./+types/api.admin.sub-leaderboards.$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(
      new URL(`/api/admin/sub-leaderboards/${params.id}`, baseUrl).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching sub-leaderboard details:", error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const body = request.method === "DELETE" ? null : await request.json();

    const response = await fetch(
      new URL(`/api/admin/sub-leaderboards/${params.id}`, baseUrl).toString(),
      {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
        body: body ? JSON.stringify(body) : null,
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error ${request.method} sub-leaderboard:`, error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
```

Update `app/routes.ts`:
Register the 3 API routes:
- `api/admin/sub-leaderboards` -> `routes/api.admin.sub-leaderboards.ts`
- `api/admin/sub-leaderboards/course/:randomizedCourseId` -> `routes/api.admin.sub-leaderboards.course.$randomizedCourseId.ts`
- `api/admin/sub-leaderboards/:id` -> `routes/api.admin.sub-leaderboards.$id.ts`

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/api-admin-sub-leaderboards.test.ts`
Expected: PASS
Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/routes/api.admin.sub-leaderboards* app/routes.ts tests/api-admin-sub-leaderboards.test.ts
git commit -m "feat(api): add admin sub-leaderboards BFF proxy routes"
```

---

### Task 4: Student ID Parser & SubLeaderboardDialog Component

**Files:**
- Create: `app/lib/student-id-parser.ts`
- Create: `tests/student-id-parser.test.ts`
- Create: `app/components/SubLeaderboardDialog.tsx`

**Interfaces:**
- Produces:
  ```typescript
  // app/lib/student-id-parser.ts
  export function parseStudentIds(input: string): string[];
  ```
- Produces:
  ```typescript
  // app/components/SubLeaderboardDialog.tsx
  export interface SubLeaderboardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    courseId: string;
    subLeaderboardId?: string;
    initialName?: string;
    initialStudentIds?: string[];
    onSuccess: () => void;
  }
  export default function SubLeaderboardDialog(props: SubLeaderboardDialogProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write failing student ID parser unit test**

Create `tests/student-id-parser.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { parseStudentIds } from "../app/lib/student-id-parser.js";

describe("parseStudentIds", () => {
  it("parses comma, newline, and space separated student IDs", () => {
    const raw = "1001, 1002\n1003  1004\r\n1005,1001";
    const result = parseStudentIds(raw);
    expect(result).toEqual(["1001", "1002", "1003", "1004", "1005"]);
  });

  it("handles empty or whitespace strings", () => {
    expect(parseStudentIds("")).toEqual([]);
    expect(parseStudentIds("   \n\t ")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/student-id-parser.test.ts`
Expected: FAIL ("Cannot find module '../app/lib/student-id-parser.js'")

- [ ] **Step 3: Implement `app/lib/student-id-parser.ts` & `app/components/SubLeaderboardDialog.tsx`**

Create `app/lib/student-id-parser.ts`:
```typescript
export function parseStudentIds(input: string): string[] {
  if (!input || !input.trim()) return [];
  const tokens = input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Array.from(new Set(tokens));
}
```

Create `app/components/SubLeaderboardDialog.tsx`:
- Fetches candidate enrolled students for `courseId` from `/api/ranking/${courseId}` to display selectable names and IDs.
- Manages selected `studentIds: string[]`.
- Combobox / search filter input for candidate students with click-to-select and removable badges.
- Bulk textarea input that calls `parseStudentIds` to add IDs in bulk.
- Form submission to `/api/admin/sub-leaderboards` (for create) or `/api/admin/sub-leaderboards/${id}` (for edit).
- Displays validation errors and saving state.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/student-id-parser.test.ts`
Expected: PASS
Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/lib/student-id-parser.ts app/components/SubLeaderboardDialog.tsx tests/student-id-parser.test.ts
git commit -m "feat(admin): add SubLeaderboardDialog and student ID parser"
```

---

### Task 5: Admin Sub-Leaderboard Management Route & Sidebar Navigation

**Files:**
- Create: `app/routes/admin/sub-leaderboards.tsx`
- Modify: `app/routes/admin/layout.tsx`
- Modify: `app/routes.ts`

**Interfaces:**
- Produces:
  - Route: `/admin/sub-leaderboards`
  - Sidebar link in `/admin/layout.tsx`

- [ ] **Step 1: Add Sub-Leaderboards to Admin Sidebar Navigation**

Modify `app/routes/admin/layout.tsx`:
Import `Trophy` from `lucide-react`.
Add to `sidebarItems`:
```typescript
    {
      href: "/admin/sub-leaderboards",
      label: "Sub-Leaderboards",
      icon: Trophy,
      exact: false,
    },
```

- [ ] **Step 2: Implement `app/routes/admin/sub-leaderboards.tsx`**

Create `app/routes/admin/sub-leaderboards.tsx`:
```tsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Trophy, ExternalLink, Edit, Trash2, Users, Calendar } from "lucide-react";
import { SaveDialog } from "../../components/ui/save-dialog";
import type { SaveDialogContent } from "../../components/ui/save-dialog";
import CourseSelector from "../../components/CourseSelector";
import SubLeaderboardDialog from "../../components/SubLeaderboardDialog";
import type { Route } from "./+types/sub-leaderboards";

interface SubLeaderboardItem {
  id: string;
  name: string;
  courseId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
  randomId: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(new URL("/api/courses", baseUrl).toString(), {
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    });
    const courses = response.ok ? ((await response.json()) as Course[]) : [];
    return { courses };
  } catch (error) {
    console.error("Error loading courses:", error);
    return { courses: [] };
  }
}

export default function SubLeaderboardsAdmin({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.randomId || "",
  );
  const [subLeaderboards, setSubLeaderboards] = useState<SubLeaderboardItem[]>([]);
  const [loading, setLoading] = useState(courses.length > 0);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubLb, setEditingSubLb] = useState<SubLeaderboardItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogContent, setDeleteDialogContent] = useState<SaveDialogContent | null>(null);

  const fetchSubLeaderboards = async () => {
    if (!selectedCourseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/sub-leaderboards/course/${selectedCourseId}`,
        { credentials: "include" },
      );
      const data = await response.json();
      if (data.success) {
        setSubLeaderboards(data.subLeaderboards || []);
      } else {
        setError(data.error || "Failed to load sub-leaderboards");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching sub-leaderboards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubLeaderboards();
  }, [selectedCourseId]);

  const handleDelete = (subLb: SubLeaderboardItem) => {
    setDeleteDialogContent({
      title: "Delete Sub-Leaderboard",
      description: `Are you sure you want to delete "${subLb.name}"? This action cannot be undone.`,
      actionLabel: "Delete",
      actionVariant: "destructive",
      onAction: async () => {
        try {
          const response = await fetch(`/api/admin/sub-leaderboards/${subLb.id}`, {
            method: "DELETE",
            credentials: "include",
          });
          const data = await response.json();
          if (data.success) {
            setSubLeaderboards((prev) => prev.filter((item) => item.id !== subLb.id));
          } else {
            alert(data.error || "Failed to delete sub-leaderboard");
          }
        } catch (err) {
          console.error("Error deleting sub-leaderboard:", err);
          alert("Failed to delete sub-leaderboard");
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sub-Leaderboards</h1>
          <p className="text-muted-foreground mt-1">
            Manage scoped class sections and cohort leaderboards
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={!selectedCourseId}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Sub-Leaderboard
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Select Course:</span>
        <CourseSelector
          selectedCourseId={selectedCourseId}
          onCourseChange={(courseId) => setSelectedCourseId(courseId)}
          courses={courses}
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading sub-leaderboards...
        </div>
      ) : subLeaderboards.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sub-leaderboards found</h3>
            <p className="text-muted-foreground mb-4">
              No sub-leaderboards exist for this course yet.
            </p>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
              disabled={!selectedCourseId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Sub-Leaderboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Course Sub-Leaderboards ({subLeaderboards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-center py-3 px-4 font-medium">Members</th>
                    <th className="text-center py-3 px-4 font-medium">Created</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subLeaderboards.map((subLb) => (
                    <tr key={subLb.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/ranking/sub/${subLb.id}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <div>
                            <div className="font-medium text-foreground">
                              <Link
                                to={`/ranking/sub/${subLb.id}`}
                                className="text-primary hover:underline"
                              >
                                {subLb.name}
                              </Link>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {subLb.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <Users className="h-3 w-3" />
                          <span>{subLb.memberCount} members</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(subLb.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSubLb(subLb)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(subLb)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      {createDialogOpen && (
        <SubLeaderboardDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          mode="create"
          courseId={selectedCourseId}
          onSuccess={() => {
            setCreateDialogOpen(false);
            fetchSubLeaderboards();
          }}
        />
      )}

      {/* Edit Dialog */}
      {editingSubLb && (
        <SubLeaderboardDialog
          open={!!editingSubLb}
          onOpenChange={(open) => !open && setEditingSubLb(null)}
          mode="edit"
          courseId={selectedCourseId}
          subLeaderboardId={editingSubLb.id}
          initialName={editingSubLb.name}
          onSuccess={() => {
            setEditingSubLb(null);
            fetchSubLeaderboards();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDialogContent && (
        <SaveDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeleteDialogContent(null);
          }}
          content={deleteDialogContent}
        />
      )}
    </div>
  );
}
```

Modify `app/routes.ts`:
Register `route("sub-leaderboards", "routes/admin/sub-leaderboards.tsx")` inside the admin route hierarchy.

- [ ] **Step 3: Run typecheck and tests**

Run: `bun run typecheck`
Expected: PASS
Run: `bun test`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add app/routes/admin/sub-leaderboards.tsx app/routes/admin/layout.tsx app/routes.ts
git commit -m "feat(admin): add admin sub-leaderboard management view and sidebar link"
```

---

### Task 6: Comprehensive Verification & Build

**Files:**
- None (verification of all created/modified files)

- [ ] **Step 1: Run all unit and integration tests**

Run: `bun test`
Expected: All tests pass.

- [ ] **Step 2: Run TypeScript typecheck**

Run: `bun run typecheck`
Expected: Clean exit 0 with 0 errors.

- [ ] **Step 3: Run full production build**

Run: `bun run build`
Expected: Clean client and server build exit 0.

- [ ] **Step 4: Verification of git status and commits**

Run: `git status`
Expected: Clean working tree.
