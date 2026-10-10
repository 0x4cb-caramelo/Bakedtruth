/**
 * Purpose: a read-only client for the read API (`services/api`, /api/v1): health, the campaign list and one campaign.
 *          Typed from the API's JSON; it imports no server code. Each call returns the body or throws an ApiError with
 *          the API's own code. The base URL comes from NEXT_PUBLIC_API_URL; nothing secret is sent or kept.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */

export type Health = {
  status: "starting" | "ok" | "stale";
  cluster: "devnet" | "local";
  schema_version: number;
  as_of_slot: string | null;
  taken_at: string | null;
  campaigns_total: number | null;
  last_refresh_error: string | null;
};

export type PublicState = "open" | "closed" | "in_review" | "paid" | "void";
export type ListState = PublicState | "active" | "resolved";

export type Campaign = {
  address: string;
  id: string;
  state: PublicState;
  kind: string;
  status: string;
  outcome: string;
  creator: string;
  creator_is_team: boolean;
  pool_yes: string | null;
  pool_no: string | null;
  prize_lamports: string | null;
  entries_close_at: string | null;
  deadline_at: string | null;
  review_ends_at: string | null;
  resolved_at: string | null;
  target: string | null;
  metric_account: string;
};

export type CampaignList = {
  as_of_slot: string;
  chain_time: string;
  total: number;
  offset: number;
  limit: number;
  campaigns: Campaign[];
};

export type ListQuery = { state?: ListState; limit?: number; offset?: number };

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function createApiClient(options: { base: string; fetch?: FetchLike }) {
  const fetchFn: FetchLike = options.fetch ?? ((input, init) => fetch(input, init));
  const base = options.base.replace(/\/+$/, "");

  async function read<T>(path: string, query?: URLSearchParams): Promise<{ status: number; body: T }> {
    const url = `${base}${path}${query && query.toString() ? `?${query}` : ""}`;
    let response: Response;
    try {
      response = await fetchFn(url, { headers: { accept: "application/json" }, cache: "no-store" });
    } catch {
      throw new ApiError("unreachable", 0, "the read API did not answer");
    }
    const body = (await response.json().catch(() => null)) as
      T | { error?: { code?: string; message?: string } } | null;
    return { status: response.status, body: body as T };
  }

  function fail(status: number, body: unknown): never {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(error?.code ?? "http_error", status, error?.message ?? `HTTP ${status}`);
  }

  return {
    /** Health answers 503 while starting; that body is returned, not thrown, so the shell can show the state. */
    async getHealth(): Promise<Health> {
      const { status, body } = await read<Health>("/api/v1/health");
      if (status === 200 || status === 503) return body;
      return fail(status, body);
    },
    async listCampaigns(query: ListQuery = {}): Promise<CampaignList> {
      const params = new URLSearchParams();
      if (query.state) params.set("state", query.state);
      if (query.limit !== undefined) params.set("limit", String(query.limit));
      if (query.offset !== undefined) params.set("offset", String(query.offset));
      const { status, body } = await read<CampaignList>("/api/v1/campaigns", params);
      if (status === 200) return body;
      return fail(status, body);
    },
    async getCampaign(address: string): Promise<Campaign> {
      const { status, body } = await read<{ campaign: Campaign }>(`/api/v1/campaigns/${encodeURIComponent(address)}`);
      if (status === 200) return (body as { campaign: Campaign }).campaign;
      return fail(status, body);
    },
  };
}

/** True only when the read API reports itself fresh. The shell uses it to show or hide the entry panel and the box. */
export const entriesAllowed = (health: Pick<Health, "status"> | null | undefined): boolean => health?.status === "ok";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4220";
export const api = createApiClient({ base: API_BASE });
