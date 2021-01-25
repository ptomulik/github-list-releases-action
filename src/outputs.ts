import * as core from "@actions/core";

export function setOutputs(entries: unknown[]): void {
  const json = JSON.stringify(entries);
  const ascii = Buffer.from(json).toString("base64");
  core.setOutput("json", json);
  core.setOutput("base64", ascii);
  core.setOutput("count", entries.length);
}

// vim: set ts=2 sw=2 sts=2:
