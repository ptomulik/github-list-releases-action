import { run } from "../src/action";
import { mocked } from "ts-jest/utils";

jest.mock("../src/action");

describe("index", () => {
  it("executes action.run()", () => {
    expect.assertions(1);
    mocked(run).mockImplementation(async () => {
      /* empty */
    });
    mocked(run).mockClear();
    require("../src/index");
    expect(mocked(run)).toHaveBeenCalledWith();
  });
});

// vim: set ts=2 sw=2 sts=2:
