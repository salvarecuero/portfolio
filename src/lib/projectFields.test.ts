import { describe, it, expect } from "vitest";
import { accentColor, projectOrder } from "./projectFields";

describe("accentColor", () => {
  it("accepts 3-, 6- and 8-digit hex colors", () => {
    expect(accentColor.safeParse("#fff").success).toBe(true);
    expect(accentColor.safeParse("#0ea5e9").success).toBe(true);
    expect(accentColor.safeParse("#6366F1").success).toBe(true);
    expect(accentColor.safeParse("#0ea5e9ff").success).toBe(true);
  });

  it("is optional (undefined passes)", () => {
    expect(accentColor.safeParse(undefined).success).toBe(true);
  });

  it("rejects named colors and non-hex strings", () => {
    expect(accentColor.safeParse("red").success).toBe(false);
    expect(accentColor.safeParse("rgb(1,2,3)").success).toBe(false);
  });

  it("rejects malformed hex (wrong length, missing hash)", () => {
    expect(accentColor.safeParse("#0ea5e").success).toBe(false); // 5 digits
    expect(accentColor.safeParse("0ea5e9").success).toBe(false); // no #
  });

  it("rejects a value that would inject extra CSS declarations", () => {
    expect(accentColor.safeParse("#0ea5e9; position:fixed; inset:0").success).toBe(false);
  });
});

describe("projectOrder", () => {
  it("accepts non-negative integers", () => {
    expect(projectOrder.safeParse(0).success).toBe(true);
    expect(projectOrder.safeParse(2).success).toBe(true);
  });

  it("defaults to 0 when undefined", () => {
    expect(projectOrder.parse(undefined)).toBe(0);
  });

  it("rejects floats and negative numbers", () => {
    expect(projectOrder.safeParse(1.5).success).toBe(false);
    expect(projectOrder.safeParse(-1).success).toBe(false);
  });
});
