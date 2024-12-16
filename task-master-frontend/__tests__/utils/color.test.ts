import { getPriorityColor, getStatusColor } from "@/utils/color";

describe("Color Utilities", () => {
  describe("getPriorityColor", () => {
    it("should return correct color for each priority level", () => {
      expect(getPriorityColor("low")).toBe("green");
      expect(getPriorityColor("medium")).toBe("orange");
      expect(getPriorityColor("high")).toBe("red");
    });
  });

  describe("getStatusColor", () => {
    it("should return correct color for each status", () => {
      expect(getStatusColor("pending")).toBe("orange");
      expect(getStatusColor("not-started")).toBe("gray");
      expect(getStatusColor("in-progress")).toBe("blue");
      expect(getStatusColor("completed")).toBe("green");
      expect(getStatusColor("cancelled")).toBe("red");
      expect(getStatusColor("on-hold")).toBe("purple");
    });
  });
});
