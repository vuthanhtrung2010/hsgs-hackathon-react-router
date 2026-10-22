import { describe, expect, it } from "bun:test";
import {
  DEFAULT_RATING_THRESHOLDS,
  validateRatingThresholds,
} from "~/lib/rating";

describe("Rating Thresholds Validation", () => {
  it("validates default rating thresholds as valid", () => {
    const result = validateRatingThresholds(DEFAULT_RATING_THRESHOLDS);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("validates custom valid ascending thresholds", () => {
    const custom = {
      newbieThreshold: 0,
      amateurThreshold: 800,
      expertThreshold: 1100,
      candidateMasterThreshold: 1400,
      masterThreshold: 1700,
      grandmasterThreshold: 2000,
      targetThreshold: 2300,
      adminThreshold: 2800,
    };
    const result = validateRatingThresholds(custom);
    expect(result.valid).toBe(true);
  });

  it("rejects non-ascending thresholds with specific error message", () => {
    const invalid = {
      ...DEFAULT_RATING_THRESHOLDS,
      amateurThreshold: 1400,
      expertThreshold: 1300, // less than amateur
    };
    const result = validateRatingThresholds(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Expert (1300) must be greater than Amateur (1400)");
  });

  it("rejects negative newbie threshold", () => {
    const invalid = {
      ...DEFAULT_RATING_THRESHOLDS,
      newbieThreshold: -10,
    };
    const result = validateRatingThresholds(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Newbie threshold must be at least 0");
  });

  it("rejects missing or NaN threshold values", () => {
    const invalid = {
      ...DEFAULT_RATING_THRESHOLDS,
      adminThreshold: NaN,
    };
    const result = validateRatingThresholds(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Admin threshold must be a valid number");
  });
});
