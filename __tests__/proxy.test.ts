import { describe, it, expect } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../proxy";

describe("proxy matcher", () => {
  it("matches protected routes", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, url: "/", nextConfig: {} })
    ).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: "/onboarding",
        nextConfig: {},
      })
    ).toBe(true);
  });

  it("skips public routes", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: "/api/auth/callback/resend",
        nextConfig: {},
      })
    ).toBe(false);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: "/_next/static/chunks/main.js",
        nextConfig: {},
      })
    ).toBe(false);
  });
});
