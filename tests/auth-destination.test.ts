import { describe, expect, it } from "vitest";
import { authDestination } from "../src/lib/auth-destination";

const returning = { id: "member-123", created_at: "2026-09-01T12:00:00Z", last_sign_in_at: "2026-10-13T22:00:00Z" };
describe("member login destinations", () => {
  it("opens an existing member's own profile", () => {
    expect(authDestination(returning)).toBe("/u/member-123");
  });
  it("welcomes a newly created member, including OAuth on login", () => {
    expect(authDestination({ ...returning, created_at: returning.last_sign_in_at })).toBe("/welcome");
  });
  it("keeps the memorial invitation destination", () => {
    expect(authDestination(returning, "/memorial/bella")).toBe("/memorial/bella");
  });
  it("rejects external and backslash destinations", () => {
    expect(authDestination(returning, "//example.com")).toBe("/u/member-123");
    expect(authDestination(returning, "/\\example.com")).toBe("/u/member-123");
  });
});