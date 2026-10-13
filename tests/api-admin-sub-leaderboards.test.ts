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
