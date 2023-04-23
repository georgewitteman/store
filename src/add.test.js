import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { add } from "./add.js";

describe("add", () => {
  it("should add two numbers", () => {
    assert.equal(add(1, 1), 2);
  });
});
