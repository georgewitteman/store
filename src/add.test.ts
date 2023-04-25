import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { add, add3 } from "./add.js";

describe("add", () => {
  it("should add two numbers", () => {
    assert.equal(add(1, 1), 2);
  });
});

describe("add3", () => {
  it("should add three numbers", () => {
    assert.equal(add3(1, 2, 3), 6);
  });
});
