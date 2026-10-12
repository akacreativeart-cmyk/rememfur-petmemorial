import { describe, expect, test } from "bun:test";
import { memorialInviteEmail, memorialInviteUrl } from "../src/lib/memorial-invite";

describe("memorial invitations", () => {
  test("friends land directly on the specified memorial, not welcome", () => {
    expect(memorialInviteUrl("luna-123")).toBe("https://rememfur.com/memorial/luna-123");
  });
  test("one email contains the memorial link and personal note", () => {
    const uri = memorialInviteEmail("friend@example.com", "Luna", "luna-123", "I miss her too.");
    expect(uri.split("?")[0]).toBe("mailto:friend%40example.com");
    const query = new URLSearchParams(uri.split("?")[1]);
    expect(query.get("body")).toContain("https://rememfur.com/memorial/luna-123");
    expect(query.get("body")).toContain("I miss her too.");
  });
  test("invitation cannot add additional recipients or mail headers", () => {
    for (const address of ["a@example.com,b@example.com", "a@example.com?bcc=b@example.com", "a@example.com\r\nbcc:b@example.com"]) {
      expect(() => memorialInviteEmail(address, "Luna", "luna-123", "")).toThrow();
    }
  });
});