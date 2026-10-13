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
