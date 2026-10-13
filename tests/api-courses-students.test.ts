import { describe, expect, it } from "bun:test";
import { loader as getCourseStudents } from "../app/routes/api.courses.$courseId.students.js";

describe("API courses students proxy route", () => {
  it("rejects non-GET requests with 405", async () => {
    const req = new Request("http://localhost/api/courses/123/students", {
      method: "POST",
    });
    const res = await getCourseStudents({
      request: req,
      params: { courseId: "123" },
    } as any);
    expect(res.status).toBe(405);
  });
});
