import * as utils from "../src/utils";

test("{}: true", () => {
  expect(utils.isPlainObject({})).toBe(true);
});

test("DOM element: false", () => {
  expect(utils.isPlainObject(document.createElement("div"))).toBe(false);
});

test("null: false", () => {
  expect(utils.isPlainObject(null)).toBe(false);
});

test("Object.create(null): false", () => {
  expect(utils.isPlainObject(Object.create(null))).toBe(false);
});

test("Instance of other object: false", () => {
  const data = new Date();
  expect(utils.isPlainObject(data)).toBe(false);
});

test("Number primitive: false", () => {
  expect(utils.isPlainObject(1)).toBe(false);
});

test("String primitive: false", () => {
  expect(utils.isPlainObject("1")).toBe(false);
});

test("Number Object: false", () => {
  expect(utils.isPlainObject(Number(1))).toBe(false);
});

test("Built-in Math: false", () => {
  expect(utils.isPlainObject(Math)).toBe(false);
});
