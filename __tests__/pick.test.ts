import { pick } from "../src/pick";

describe("pick", () => {
  describe.each([
    [{}, [], {}],
    [{ foo: "" }, [], {}],
    [{ foo: "" }, ["foo"], { foo: "" }],
    [{ foo: "", bar: 0 }, ["foo"], { foo: "" }],
    [{ bar: 0 }, ["foo"], {}],
    [{ foo: undefined, bar: 0 }, ["foo"], { foo: undefined }],
  ] as [Record<string, unknown>, string[], Record<string, unknown>][])(
    "pick(%j, %j)",
    (record, keys, result) => {
      it(`returns ${result}`, () => {
        expect.assertions(1);
        expect(pick(record, keys)).toStrictEqual(result);
      });
    }
  );
});

// vim: set ts=2 sw=2 sts=2:
