import { describe, it, expect } from "vitest";
import { safeDivide, toPercent, formatNumber } from "../mathUtils";

describe("safeDivide", () => {
    it("divides normally", () => {
        expect(safeDivide(10, 2)).toBe(5);
    });

    it("returns 0 when denominator is 0", () => {
        expect(safeDivide(5, 0)).toBe(0);
    });

    it("returns 0 when both are 0", () => {
        expect(safeDivide(0, 0)).toBe(0);
    });

    it("handles fractional results", () => {
        expect(safeDivide(1, 3)).toBeCloseTo(0.3333);
    });
});

describe("toPercent", () => {
    it("multiplies by 100", () => {
        expect(toPercent(0.5)).toBe(50);
    });

    it("handles 0", () => {
        expect(toPercent(0)).toBe(0);
    });

    it("handles 1", () => {
        expect(toPercent(1)).toBe(100);
    });
});

describe("formatNumber", () => {
    it("formats a percentage with one decimal place", () => {
        expect(formatNumber(0.456, true)).toBe("45.6%");
    });

    it("rounds percentage to one decimal", () => {
        expect(formatNumber(0.3333, true)).toBe("33.3%");
    });

    it("formats a whole number without percentage", () => {
        expect(formatNumber(42, false)).toBe("42");
    });

    it("formats 0 as a percentage", () => {
        expect(formatNumber(0, true)).toBe("0.0%");
    });
});
