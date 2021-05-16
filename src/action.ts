import * as core from "@actions/core";
import { Octokit as OctokitCore } from "@octokit/core";
import { Processor } from "./processor";
import { getInputs } from "./inputs";
import { setOutputs } from "./outputs";
import { RequestParameters } from "./types";
import { pick } from "./pick";
import { listReleases } from "./list-releases";

export const Octokit = OctokitCore.plugin(listReleases);

async function doRun() {
  const inputs = getInputs();
  const params: RequestParameters = pick(inputs, ["owner", "repo", "per_page"]);
  const octokit = new Octokit({ auth: inputs.token });

  const entries = await octokit.listReleases(params, inputs.max_entries);
  const processor = new Processor(inputs);
  setOutputs(processor.process(entries));
}

export async function run(): Promise<void> {
  try {
    await doRun();
  } catch (error) {
    core.setFailed(error.message);
  }
}

// vim: set ts=2 sw=2 sts=2:
