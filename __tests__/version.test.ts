import { VERSION } from "../src/version";

import pkg = require("../package.json");

describe("version", () => {
  describe("vERSION", () => {
    it(`equals ${pkg.version}`, () => {
      expect.assertions(1);
      expect(VERSION).toStrictEqual(pkg.version);
    });
  });
});

// vim: set ts=2 sw=2 sts=2:
