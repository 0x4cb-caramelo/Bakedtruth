/**
 * Purpose: the read API client with a fake fetch: the URLs and query it builds, the body on 200 and on health's 503,
 *          the named ApiError on other answers, the unreachable case, and the entries-allowed flag (ok only).
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import { describe, expect, test } from "bun:test";
import { ApiError, createApiClient, entriesAllowed, type FetchLike, type Health } from "./api-client";

function fake(responder: (url: string) => { status: number; body: unknown } | "network") {
  const urls: string[] = [];
  const fetch: FetchLike = async (url) => {
    urls.push(url);
    const answer = responder(url);
    if (answer === "network") throw new TypeError("fetch failed");
    return new Response(JSON.stringify(answer.body), { status: answer.status });
  };
  return { fetch, urls };
}

const BASE = "http://127.0.0.1:4220/";

describe("api client", () => {
  test("builds the list URL from the query, and strips the base's trailing slash", async () => {
    const { fetch, urls } = fake(() => ({ status: 200, body: { campaigns: [], total: 0 } }));
    const api = createApiClient({ base: BASE, fetch });
    await api.listCampaigns({ state: "active", limit: 10, offset: 20 });
    expect(urls[0]).toBe("http://127.0.0.1:4220/api/v1/campaigns?state=active&limit=10&offset=20");
    await api.listCampaigns();
    expect(urls[1]).toBe("http://127.0.0.1:4220/api/v1/campaigns");
  });

  test("getCampaign encodes the address and returns the campaign", async () => {
    const { fetch, urls } = fake(() => ({ status: 200, body: { campaign: { address: "abc", state: "open" } } }));
    const campaign = await createApiClient({ base: BASE, fetch }).getCampaign("abc");
    expect(urls[0]).toBe("http://127.0.0.1:4220/api/v1/campaigns/abc");
    expect(campaign.state).toBe("open");
  });

  test("a 400 from the list is a named ApiError with the API's code", async () => {
    const { fetch } = fake(() => ({
      status: 400,
      body: { error: { code: "bad_query", message: "unknown parameter: x" } },
    }));
    const error = await createApiClient({ base: BASE, fetch })
      .listCampaigns()
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "bad_query", status: 400 });
  });

  test("a 404 for an unknown campaign is not_found", async () => {
    const { fetch } = fake(() => ({ status: 404, body: { error: { code: "not_found", message: "no campaign" } } }));
    await expect(createApiClient({ base: BASE, fetch }).getCampaign("x")).rejects.toMatchObject({ code: "not_found" });
  });

  test("health returns its body on 503 (starting), so the shell can show it", async () => {
    const body: Health = {
      status: "starting",
      cluster: "devnet",
      schema_version: 1,
      as_of_slot: null,
      taken_at: null,
      campaigns_total: null,
      last_refresh_error: null,
    };
    const { fetch } = fake(() => ({ status: 503, body }));
    expect(await createApiClient({ base: BASE, fetch }).getHealth()).toEqual(body);
  });

  test("a network failure is the named code unreachable, status 0", async () => {
    const { fetch } = fake(() => "network");
    await expect(createApiClient({ base: BASE, fetch }).getHealth()).rejects.toMatchObject({
      code: "unreachable",
      status: 0,
    });
  });
});

describe("entriesAllowed", () => {
  test("true only when the API reports ok", () => {
    expect(entriesAllowed({ status: "ok" })).toBe(true);
    expect(entriesAllowed({ status: "stale" })).toBe(false);
    expect(entriesAllowed({ status: "starting" })).toBe(false);
    expect(entriesAllowed(null)).toBe(false);
    expect(entriesAllowed(undefined)).toBe(false);
  });
});
