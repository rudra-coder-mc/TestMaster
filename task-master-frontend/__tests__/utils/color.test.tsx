/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPriorityColor, getStatusColor } from "../../utils/color";

describe("Color Utilities", () => {
  describe("getPriorityColor", () => {
    it.each([
      ["low", "green"],
      ["medium", "orange"],
      ["high", "red"],
    ])("returns %s color for %s priority", (priority, expectedColor) => {
      expect(getPriorityColor(priority as any)).toBe(expectedColor);
    });
    it("handles invalid priority gracefully", () => {
      expect(getPriorityColor("invalid")).toBe(undefined);
    });
  });

  describe("getStatusColor", () => {
    it.each([
      ["pending", "orange"],
      ["not-started", "gray"],
      ["in-progress", "blue"],
      ["completed", "green"],
      ["cancelled", "red"],
      ["on-hold", "purple"],
    ])("returns %s color for %s status", (status, expectedColor) => {
      expect(getStatusColor(status as any)).toBe(expectedColor);
    });
    it("handles invalid status gracefully", () => {
      expect(getStatusColor("invalid" as any)).toBe(undefined);
    });
  });
});
