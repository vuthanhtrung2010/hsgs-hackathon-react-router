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
