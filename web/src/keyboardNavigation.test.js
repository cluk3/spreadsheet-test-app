import {
  getCellDownId,
  getCellUpId,
  getCellLeftId,
  getCellRightId,
} from "./keyboardNavigation";

test("getCellDownId", () => {
  expect(getCellDownId("J10")).toBe("A1");
  expect(getCellDownId("A10")).toBe("B1");
  expect(getCellDownId("B1")).toBe("B2");
});

test("getCellUpId", () => {
  expect(getCellUpId("A1")).toBe("J10");
  expect(getCellUpId("B1")).toBe("A10");
  expect(getCellUpId("B2")).toBe("B1");
});

test("getCellLeftId", () => {
  expect(getCellLeftId("A1")).toBe("J1");
  expect(getCellLeftId("B10")).toBe("A10");
});

test("getCellRightId", () => {
  expect(getCellRightId("J1")).toBe("A1");
  expect(getCellRightId("A10")).toBe("B10");
});
