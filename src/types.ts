import { PaginatingEndpoints } from "@octokit/plugin-paginate-rest";

type RequestTypes = PaginatingEndpoints["GET /repos/{owner}/{repo}/releases"];
export type RequestParameters = RequestTypes["parameters"];
export type RequestResponse = RequestTypes["response"];
export type Releases = RequestResponse["data"];
export type Release = Releases[0];

export type OrderSpec = "A" | "D";
export type NameSpec = string | RegExp | null;
export type SliceSpec =
  | {
      type: "A";
    }
  | {
      type: "F" | "L";
      count: number;
    }
  | {
      type: "R";
      from: number;
      to?: number | null;
    };

export type Sortable =
  | "url"
  | "assets_url"
  | "upload_url"
  | "html_url"
  | "id"
  | "node_id"
  | "tag_name"
  | "target_commitish"
  | "name"
  | "draft"
  | "prerelease"
  | "created_at"
  | "published_at"
  | "tarball_url"
  | "zipball_url"
  | "body"
  | "body_html"
  | "body_text";

export type Selectable =
  | "url"
  | "assets_url"
  | "upload_url"
  | "html_url"
  | "id"
  | "author"
  | "node_id"
  | "tag_name"
  | "target_commitish"
  | "name"
  | "draft"
  | "prerelease"
  | "created_at"
  | "published_at"
  | "assets"
  | "tarball_url"
  | "zipball_url"
  | "body"
  | "body_html"
  | "body_text";

export type SortSpec = [Sortable, OrderSpec];
export type SortSpecs = SortSpec[] | null;
export type SelectSpecs = Selectable[] | null;

export interface SafeInputs {
  token: string | null;
  owner: string;
  repo: string;
  name: NameSpec;
  per_page?: number;
  max_entries: number | null;
  tag_name: NameSpec;
  draft: boolean | null;
  prerelease: boolean | null;
  sort: SortSpecs;
  order: OrderSpec;
  select: Selectable[] | null;
  slice: SliceSpec;
}
