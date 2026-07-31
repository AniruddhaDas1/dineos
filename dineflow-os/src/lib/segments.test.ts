import { describe, it, expect } from "vitest";
import { segmentCustomer } from "./segments";
import type { CustomerProfile } from "@/services/types";

const DAY = 86_400_000;
const now = Date.now();

function makeProfile(overrides: Partial<CustomerProfile> = {}): CustomerProfile {
  return {
    name: "Test",
    mobile: "9000000000",
    visits: 5,
    totalSpend: 5000,
    points: 50,
    tier: "silver",
    lastVisit: now - 10 * DAY,
    favoriteItems: [],
    avgRating: 4,
    ...overrides,
  };
}

describe("segmentCustomer", () => {
  it("segments churned customers (last visit > 90 days)", () => {
    const profile = makeProfile({ lastVisit: now - 91 * DAY });
    expect(segmentCustomer(profile)).toBe("churned");
  });

  it("segments at-risk customers (last visit > 30 days)", () => {
    const profile = makeProfile({ lastVisit: now - 31 * DAY });
    expect(segmentCustomer(profile)).toBe("at-risk");
  });

  it("segments vip customers (gold tier)", () => {
    const profile = makeProfile({ tier: "gold" });
    expect(segmentCustomer(profile)).toBe("vip");
  });

  it("segments vip customers (platinum tier)", () => {
    const profile = makeProfile({ tier: "platinum" });
    expect(segmentCustomer(profile)).toBe("vip");
  });

  it("segments new customers (< 2 visits)", () => {
    const profile = makeProfile({ visits: 1 });
    expect(segmentCustomer(profile)).toBe("new");
  });

  it("segments regular customers (default)", () => {
    const profile = makeProfile();
    expect(segmentCustomer(profile)).toBe("regular");
  });
});
