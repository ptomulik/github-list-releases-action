import type { Octokit } from "@octokit/core";
import type { RequestParameters, RequestResponse, Releases } from "./types";
import { composePaginateRest } from "@octokit/plugin-paginate-rest";
import {
  limit,
  adjust,
  MapFunction,
} from "@ptomulik/octokit-paginate-rest-limit";

export interface ListReleasesPlugin {
  listReleases: (
    parameters: RequestParameters,
    max?: number | null
  ) => Promise<Releases>;
}

export function listReleases(octokit: Octokit): ListReleasesPlugin {
  return {
    listReleases: async (
      parameters: RequestParameters,
      max?: number | null
    ) => {
      const endpoint = "GET /repos/{owner}/{repo}/releases";
      return max != null
        ? await composePaginateRest(
            octokit,
            endpoint,
            adjust(max, parameters),
            limit(max) as MapFunction<RequestResponse>
          )
        : await composePaginateRest(octokit, endpoint, parameters);
    },
  };
}

// vim: set ts=2 sw=2 sts=2:
