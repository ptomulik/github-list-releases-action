/*eslint no-unused-vars: ["error", {"argsIgnorePattern": "^_\\d*$"}]*/
/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

import { mocked } from "ts-jest/utils";
import { repr } from "./util";
import { error, setFailed } from "@actions/core";
import { SafeInputs } from "../src/types";
import { getInputs, ValidationError } from "../src/inputs";
import { setOutputs } from "../src/outputs";
import { run } from "../src/action";
import { listReleases, ListReleasesPlugin } from "../src/list-releases";

jest.mock("@actions/core");
jest.mock("../src/inputs");
jest.mock("../src/outputs");
jest.mock("../src/list-releases");

interface RequestParameters {
  per_page?: number;
  [key: string]: unknown;
}

class ActionTestCase<I> {
  inputs: I;
  entries: unknown[];

  static create<I>(inputs: I, entries?: unknown[]) {
    const instance = new ActionTestCase(inputs, entries);
    jest.spyOn(instance, "listReleases");
    return instance;
  }

  private constructor(inputs: I, entries?: unknown[]) {
    this.inputs = inputs;
    this.entries = entries !== undefined ? entries : [];
    mocked(listReleases).mockImplementation(this.listReleasesMockImpl);
    mocked(setFailed).mockImplementation(() => {
      /* empty */
    });
    mocked(error).mockImplementation(() => {
      /* emtpy */
    });
    mocked(getInputs).mockImplementation(this.getInputs);
    mocked(setOutputs).mockImplementation(() => {
      /* empty */
    });
  }

  async listReleases(params: RequestParameters, max?: number | null) {
    return max == null ? this.entries : this.entries.slice(0, max);
  }

  get listReleasesMockImpl() {
    return () => {
      return {
        listReleases: async (params: RequestParameters, max?: number | null) =>
          await this.listReleases(params, max),
      } as unknown as ListReleasesPlugin;
    };
  }

  get getInputs() {
    return (() => {
      if (this.inputs instanceof ValidationError) {
        throw this.inputs;
      }
      return this.inputs;
    }) as unknown as () => SafeInputs;
  }

  setUp() {
    mocked(this.listReleases).mockClear();
    mocked(listReleases).mockClear();
    mocked(error).mockClear();
    mocked(setFailed).mockClear();
    mocked(getInputs).mockClear();
    mocked(setOutputs).mockClear();
  }

  tearDown() {
    mocked(this.listReleases).mockReset();
    mocked(listReleases).mockReset();
    mocked(error).mockReset();
    mocked(setFailed).mockReset();
    mocked(getInputs).mockReset();
    mocked(setOutputs).mockReset();
  }
}

describe("action", () => {
  function examine(
    _: ValidationError
  ): (_: (_: ActionTestCase<ValidationError>) => Promise<void>) => void;
  function examine<I>(
    _1: I,
    _2: unknown[]
  ): (_: (_: ActionTestCase<I>) => Promise<void>) => void;
  function examine<I>(inputs: I, entries?: unknown[]) {
    return async (callback: (_: ActionTestCase<I>) => Promise<void>) => {
      const testCase = ActionTestCase.create(inputs, entries);
      try {
        testCase.setUp();
        await callback(testCase);
      } finally {
        testCase.tearDown();
      }
    };
  }

  describe(".run()", () => {
    describe.each([
      [{}, [], [{}, undefined], []],
      [
        { owner: "github", repo: "docs" },
        [1, 2],
        [{ owner: "github", repo: "docs" }, undefined],
        [1, 2],
      ],
      [
        { name: "latest" },
        [
          { name: "latest", id: 1 },
          { name: "oldest", id: 2 },
        ],
        [{}, undefined],
        [{ name: "latest", id: 1 }],
      ],
      [{ per_page: 100 }, [], [{ per_page: 100 }, undefined], []],
      [{ max_entries: 100 }, [], [{}, 100], []],
      [{ max_entries: 30, per_page: 100 }, [], [{ per_page: 100 }, 30], []],
      [{ max_entries: 4 }, [0, 1, 2, 3, 4, 5, 6, 7, 8], [{}, 4], [0, 1, 2, 3]],
      [
        { max_entries: 4, per_page: 3 },
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        [{ per_page: 3 }, 4],
        [0, 1, 2, 3],
      ],
    ])("with inputs: %j, entries: %j", (inputs, entries, args, output) => {
      it(`calls octokit.listReleases(${args
        .map(repr)
        .join(", ")})`, async () => {
        expect.assertions(1);
        await examine(
          inputs,
          entries
        )(async (testCase) => {
          await run();
          expect(mocked(testCase.listReleases)).toHaveBeenCalledWith(...args);
        });
      });

      it(`calls setOutputs(${JSON.stringify(output)})`, async () => {
        expect.assertions(1);
        await examine(
          inputs,
          entries
        )(async () => {
          await run();
          expect(mocked(setOutputs)).toHaveBeenCalledWith(output);
        });
      });

      it("does not call '@actions/core'.setFailed()", async () => {
        expect.assertions(1);
        await examine(
          inputs,
          entries
        )(async () => {
          await run();
          expect(mocked(setFailed)).not.toHaveBeenCalled();
        });
      });
    });

    describe("when exception is thrown", () => {
      const error = new ValidationError("doh!");
      it("calls '@actions/core'.setFailed(...)", async () => {
        expect.assertions(2);
        await examine(error)(async () => {
          await expect(run()).resolves.toBeUndefined();
          expect(mocked(setFailed)).toHaveBeenCalledWith(error.message);
        });
      });
    });
  });
});

// vim: set ts=2 sw=2 sts=2:
