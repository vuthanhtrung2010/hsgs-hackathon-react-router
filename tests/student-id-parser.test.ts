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
