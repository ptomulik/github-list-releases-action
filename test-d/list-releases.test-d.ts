import { expectType, expectError } from "tsd";
import { listReleases } from "../src/list-releases";
import type { Releases } from "../src/types";
import { Octokit as Core } from "@octokit/core";

const Octokit = Core.plugin(listReleases);
const octokit = new Octokit();

expectType<Promise<Releases>>(
  octokit.listReleases({ owner: "foo", repo: "bar" })
);

expectError(octokit.listReleases());
expectError(octokit.listReleases({}));
expectError(octokit.listReleases({ owner: "foo" }));
expectError(octokit.listReleases({ repo: "bar" }));
