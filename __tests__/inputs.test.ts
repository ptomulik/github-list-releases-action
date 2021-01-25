/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

import {
  validate,
  ValidateMethods,
  ValidationError,
  getInputs,
  ActionInputs,
  InternalError,
} from "../src/inputs";
import * as core from "@actions/core";
import { repr } from "./util";

interface ErrorTestInfo {
  message: string;
  description: string;
}

interface Ensure {
  returnsExpectedValue: (args: unknown[], expected: unknown) => void;
  returnsFirstArgument: (args: unknown[]) => void;
  throwsValidationError: (args: unknown[]) => void;
  throwsSyntaxError: (args: unknown[]) => void;
  throwsInternalError: (args: unknown[]) => void;
}

describe("inputs", () => {
  function errorMessage(key: string, value: unknown): string {
    return `validation failed for input ${key}: ${JSON.stringify(value)}`;
  }

  function errorTestInfo(key: string, value: unknown): ErrorTestInfo {
    return {
      message: errorMessage(key, value),
      description: `throws ValidationError('${errorMessage(key, value)}')`,
    };
  }

  function ensure(key: keyof ValidateMethods): Ensure {
    const method = validate[key] as (...args: unknown[]) => unknown;
    return {
      returnsExpectedValue: (args: unknown[], expected: unknown) => {
        it(`returns ${JSON.stringify(expected)}`, () => {
          expect.assertions(1);
          expect(method(...args)).toStrictEqual(expected);
        });
      },

      returnsFirstArgument: (args: unknown[]) => {
        it(`returns ${JSON.stringify(args[0])}`, () => {
          expect.assertions(1);
          expect(method(...args)).toBe(args[0]);
        });
      },

      throwsValidationError: (args: unknown[]) => {
        const [value] = args;
        const { description, message } = errorTestInfo(key, value);
        it(`${description}`, () => {
          expect.assertions(1);
          const call = () => method(...args);
          expect(call).toThrow(new ValidationError(message));
        });
      },

      throwsSyntaxError: (args: unknown[]) => {
        it("throws SyntaxError", () => {
          expect.assertions(1);
          const call = () => method(...args);
          expect(call).toThrow(SyntaxError);
        });
      },

      throwsInternalError: (args: unknown[]) => {
        it("throws InternalError", () => {
          expect.assertions(1);
          const call = () => method(...args);
          expect(call).toThrow(InternalError);
        });
      },
    };
  }

  function adjust<E>(entry: E): [string, E] {
    if (typeof entry === "object" && entry instanceof Array) {
      return [entry[0].map(repr).join(", "), entry];
    } else {
      throw new TypeError(
        `argument entry must be an array, ${typeof entry} provided`
      );
    }
  }

  describe(".validate", () => {
    //
    // .token()
    //

    describe.each(
      (
        [
          [[""], null],
          [["0"], "0"],
          [["null"], "null"],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.token(%s)`, (_, [args, expected]) => {
      ensure("token").returnsExpectedValue(args, expected);
    });

    //
    // .owner()
    //

    describe.each(
      (
        [
          [["j"]],
          [["john"]],
          [["John-Smith"]],
          [["john1"]],
          [["john1smith"]],
          [["john1-smith"]],
          [["john-1smith"]],
          [["1"]],
          [["123456789012345678901234567890123456789"]],
        ] as [[string]][]
      ).map(adjust)
    )(`.owner(%s) #1`, (_, [args]) => {
      ensure("owner").returnsFirstArgument(args);
    });

    describe.each(
      (
        [
          [[""]],
          [["#$%^"]],
          [["-john"]],
          [["John Smith"]],
          [["john--smith"]],
          [["1234567890123456789012345678901234567890"]],
          [["1-3-5-7-9-1-3-5-7-9-1-3-5-7-9-1-3-5-7-90"]],
        ] as [[string]][]
      ).map(adjust)
    )(`.owner(%s) #2`, (_, [args]) => {
      ensure("owner").throwsValidationError(args);
    });

    //
    // .repo()
    //
    describe.each(
      (
        [
          [["-"]],
          [["_"]],
          [["r"]],
          [["repo"]],
          [["Repo1"]],
          [["My-Awesome_Repo"]],
          [["My--Awesome__Repo"]],
          [["_My.Awesome.Repo"]],
          [["-repo"]],
          [["_repo"]],
          [[".repo"]],
          [["..repo"]],
          [[".r.epo"]],
        ] as [[string]][]
      ).map(adjust)
    )(`.repo(%s) #1`, (_, [args]) => {
      ensure("repo").returnsFirstArgument(args);
    });

    describe.each(
      ([[[""]], [["."]], [[".."]], [["re%po"]]] as [[string]][]).map(adjust)
    )(`.repo(%s) #2`, (_, [args]) => {
      ensure("repo").throwsValidationError(args);
    });

    //
    // .per_page()
    //

    describe.each(
      (
        [
          [["  "], undefined],
          [["1"], 1],
          [["100"], 100],
          [["  100  "], 100],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.per_page(%s) #1`, (_, [args, expected]) => {
      ensure("per_page").returnsExpectedValue(args, expected);
    });

    describe.each(
      ([[["."]], [["123$#"]], [["-1"]], [["101"]]] as [[string]][]).map(adjust)
    )(`.per_page(%s) #2`, (_, [args]) => {
      ensure("per_page").throwsValidationError(args);
    });

    //
    // .max_entries()
    //

    describe.each(
      (
        [
          [["  "], null],
          [["1"], 1],
          [["123"], 123],
          [["  123  "], 123],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.max_entries(%s) #1`, (_, [args, expected]) => {
      ensure("max_entries").returnsExpectedValue(args, expected);
    });

    describe.each(
      ([[["."]], [["123$#"]], [["-1"]]] as [[string]][]).map(adjust)
    )(`.max_entries(%s) #2`, (_, [args]) => {
      ensure("max_entries").throwsValidationError(args);
    });

    //
    // .name()
    //

    describe.each(
      (
        [
          [[""], null],
          [["*"], null],
          [["-"], "-"],
          [["."], "."],
          [["v1.0"], "v1.0"],
          [["latest"], "latest"],
          [["&EJH$#"], "&EJH$#"],
          [["//"], new RegExp("", "")],
          [["/asdf/ig"], new RegExp("asdf", "ig")],
          [["/\\//"], new RegExp("\\/", "")],
          [["/\\//g"], new RegExp("\\/", "g")],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.name(%s) #1`, (_, [args, expected]) => {
      ensure("name").returnsExpectedValue(args, expected);
    });

    describe.each(([[["/\\/\\/g"]]] as [[string]][]).map(adjust))(
      `.name(%s) #2`,
      (_, [args]) => {
        ensure("name").throwsSyntaxError(args);
      }
    );

    //
    // .tag_name()
    //

    describe.each(
      (
        [
          [[""], null],
          [["*"], null],
          [["-"], "-"],
          [["."], "."],
          [["v1.0"], "v1.0"],
          [["latest"], "latest"],
          [["&EJH$#"], "&EJH$#"],
          [["//"], new RegExp("", "")],
          [["/asdf/ig"], new RegExp("asdf", "ig")],
          [["/\\//"], new RegExp("\\/", "")],
          [["/\\//g"], new RegExp("\\/", "g")],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.tag_name(%s) #1`, (_, [args, expected]) => {
      ensure("tag_name").returnsExpectedValue(args, expected);
    });

    describe.each(([[["/\\/\\/g"]]] as [[string]][]).map(adjust))(
      `.tag_name(%s) #2`,
      (_, [args]) => {
        ensure("tag_name").throwsSyntaxError(args);
      }
    );

    //
    // .draft()
    //

    describe.each(
      (
        [
          [[""], null],
          [["*"], null],
          [["true"], true],
          [["false"], false],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.draft(%s) #1`, (_, [args, expected]) => {
      ensure("draft").returnsExpectedValue(args, expected);
    });

    describe.each(([[["foo"]]] as [[string]][]).map(adjust))(
      `.draft(%s) #2`,
      (_, [args]) => {
        ensure("draft").throwsValidationError(args);
      }
    );

    //
    // .prerelease()
    //

    describe.each(
      (
        [
          [[""], null],
          [["*"], null],
          [["true"], true],
          [["false"], false],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.prerelease(%s) #1`, (_, [args, expected]) => {
      ensure("prerelease").returnsExpectedValue(args, expected);
    });

    describe.each(([[["foo"]]] as [[string]][]).map(adjust))(
      `.prerelease(%s) #2`,
      (_, [args]) => {
        ensure("prerelease").throwsValidationError(args);
      }
    );

    //
    // .sort()
    //

    describe.each(
      (
        [
          [[""], null],
          [["url"], [["url", "A"]]],
          [[" \turl "], [["url", "A"]]],
          [["url \t"], [["url", "A"]]],
          [["assets_url"], [["assets_url", "A"]]],
          [["upload_url"], [["upload_url", "A"]]],
          [["html_url"], [["html_url", "A"]]],
          [["id"], [["id", "A"]]],
          [["node_id"], [["node_id", "A"]]],
          [["tag_name"], [["tag_name", "A"]]],
          [["target_commitish"], [["target_commitish", "A"]]],
          [["name"], [["name", "A"]]],
          [["draft"], [["draft", "A"]]],
          [["prerelease"], [["prerelease", "A"]]],
          [["created_at"], [["created_at", "A"]]],
          [["published_at"], [["published_at", "A"]]],
          [["tarball_url"], [["tarball_url", "A"]]],
          [["zipball_url"], [["zipball_url", "A"]]],
          [["body"], [["body", "A"]]],
          [["body_html"], [["body_html", "A"]]],
          [["body_text"], [["body_text", "A"]]],
          [
            ["url, id"],
            [
              ["url", "A"],
              ["id", "A"],
            ],
          ],
          [["url A"], [["url", "A"]]],
          [["url D"], [["url", "D"]]],
          [["url", "A"], [["url", "A"]]],
          [["url", "ASC"], [["url", "A"]]],
          [["url", "D"], [["url", "D"]]],
          [["url", "DSC"], [["url", "D"]]],
          [["url", "DESC"], [["url", "D"]]],
          [["url = A"], [["url", "A"]]],
          [["url = ASC"], [["url", "A"]]],
          [["url = D"], [["url", "D"]]],
          [["url = DSC"], [["url", "D"]]],
          [["url = DESC"], [["url", "D"]]],
          [["url = asc"], [["url", "A"]]],
          [["url = dsc"], [["url", "D"]]],
          [
            ["url A, id D"],
            [
              ["url", "A"],
              ["id", "D"],
            ],
          ],
          [
            ["url D, id A"],
            [
              ["url", "D"],
              ["id", "A"],
            ],
          ],
          [
            ["url, id D", "A"],
            [
              ["url", "A"],
              ["id", "D"],
            ],
          ],
          [
            ["url, id A", "D"],
            [
              ["url", "D"],
              ["id", "A"],
            ],
          ],
          [
            ["url D, id", "A"],
            [
              ["url", "D"],
              ["id", "A"],
            ],
          ],
          [
            ["url D, id", "D"],
            [
              ["url", "D"],
              ["id", "D"],
            ],
          ],
          [
            ["url, id", "A"],
            [
              ["url", "A"],
              ["id", "A"],
            ],
          ],
          [
            ["url, id", "D"],
            [
              ["url", "D"],
              ["id", "D"],
            ],
          ],
          [
            ["url, id", "a"],
            [
              ["url", "A"],
              ["id", "A"],
            ],
          ],
          [
            ["url, id", "d"],
            [
              ["url", "D"],
              ["id", "D"],
            ],
          ],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.sort(%s) #1`, (_, [args, expected]) => {
      ensure("sort").returnsExpectedValue(args, expected);
    });

    describe.each(
      (
        [
          [["foo"]],
          [["foo A, id D"]],
          [["id X"]],
          [[","]],
          [[",,"]],
          [["id, url X"]],
        ] as [[string]][]
      ).map(adjust)
    )(`.sort(%s) #2`, (_, [args]) => {
      ensure("sort").throwsValidationError(args);
    });

    //
    // .order()
    //

    describe.each(
      (
        [
          [[""], "A"],
          [["  \t"], "A"],
          [["A"], "A"],
          [["ASC"], "A"],
          [["D"], "D"],
          [["DSC"], "D"],
          [["DESC"], "D"],
          [["a"], "A"],
          [["asc"], "A"],
          [["d"], "D"],
          [["dsc"], "D"],
          [["desc"], "D"],
          [["\t D \t"], "D"],
          [["\t DSC \t"], "D"],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.order(%s) #1`, (_, [args, expected]) => {
      ensure("order").returnsExpectedValue(args, expected);
    });

    describe.each(
      ([[["foo"]], [["A ASC"]], [["D DSC"]]] as [[string]][]).map(adjust)
    )(`.order(%s) #2`, (_, [args]) => {
      ensure("order").throwsValidationError(args);
    });

    //
    // .select()
    //

    describe.each(
      (
        [
          [[""], null],
          [["*"], null],
          [[" \t "], null],
          [[" *\t "], null],
          [[" url\t "], ["url"]],
          [["url"], ["url"]],
          [["assets_url"], ["assets_url"]],
          [["upload_url"], ["upload_url"]],
          [["html_url"], ["html_url"]],
          [["id"], ["id"]],
          [["author"], ["author"]],
          [["node_id"], ["node_id"]],
          [["tag_name"], ["tag_name"]],
          [["target_commitish"], ["target_commitish"]],
          [["name"], ["name"]],
          [["draft"], ["draft"]],
          [["prerelease"], ["prerelease"]],
          [["created_at"], ["created_at"]],
          [["published_at"], ["published_at"]],
          [["assets"], ["assets"]],
          [["tarball_url"], ["tarball_url"]],
          [["zipball_url"], ["zipball_url"]],
          [["body"], ["body"]],
          [["body_html"], ["body_html"]],
          [["body_text"], ["body_text"]],
          [[" url, id  "], ["url", "id"]],
          [[" url  id  "], ["url", "id"]],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.select(%s) #1`, (_, [args, expected]) => {
      ensure("select").returnsExpectedValue(args, expected);
    });

    describe.each(
      ([[["foo"]], [[","]], [[" , "]]] as [[string]][]).map(adjust)
    )(`.select(%s) #2`, (_, [args]) => {
      ensure("select").throwsValidationError(args);
    });

    //
    // .slice()
    //

    describe.each(
      (
        [
          [[""], { type: "A" }],
          [[" \t"], { type: "A" }],
          [["A"], { type: "A" }],
          [["ALL"], { type: "A" }],
          [["a"], { type: "A" }],
          [["all"], { type: "A" }],
          [["  a  "], { type: "A" }],
          [[" all "], { type: "A" }],
          [["f"], { type: "F", count: 1 }],
          [["f 3"], { type: "F", count: 3 }],
          [["f = 3"], { type: "F", count: 3 }],
          [["first"], { type: "F", count: 1 }],
          [["first 3"], { type: "F", count: 3 }],
          [["first = 3"], { type: "F", count: 3 }],
          [["l"], { type: "L", count: 1 }],
          [["l 9"], { type: "L", count: 9 }],
          [["l = 9"], { type: "L", count: 9 }],
          [["last"], { type: "L", count: 1 }],
          [["last 9"], { type: "L", count: 9 }],
          [["last = 9"], { type: "L", count: 9 }],
          [["12 ..."], { type: "R", from: 12, to: null }],
          [["12 ... 21"], { type: "R", from: 12, to: 21 }],
        ] as [[string], unknown][]
      ).map(adjust)
    )(`.slice(%s) #1`, (_, [args, expected]) => {
      ensure("slice").returnsExpectedValue(args, expected);
    });

    describe.each(
      (
        [
          [["foo"]],
          [["A ?"]],
          [["f ?"]],
          [["f 3 ?"]],
          [["f = ?"]],
          [["first ?"]],
          [["first = ?"]],
          [["l ?"]],
          [["l = ?"]],
          [["last ?"]],
          [["last = ?"]],
          [["? ..."]],
          [["12 ... ?"]],
          [["? ... 21"]],
        ] as [[string]][]
      ).map(adjust)
    )(`.slice(%s) #2`, (_, [args]) => {
      ensure("slice").throwsValidationError(args);
    });

    describe("slice() matching but not capturing", () => {
      const value: {
        match: (matcher: {
          [Symbol.match](string: string): RegExpMatchArray | null;
        }) => RegExpMatchArray | null;
      } = {
        match: jest
          .fn()
          .mockImplementation(
            (matcher: {
              [Symbol.match](string: string): RegExpMatchArray | null;
            }): RegExpMatchArray | null => {
              const match = "ALL".match(matcher);
              if (match !== null) {
                match.groups = undefined;
              }
              return match;
            }
          ),
      };
      ensure("slice").throwsInternalError([value as string]);
    });

    describe("slice() matching but not capturing 'from'", () => {
      const value: {
        match: (matcher: {
          [Symbol.match](string: string): RegExpMatchArray | null;
        }) => RegExpMatchArray | null;
      } = {
        match: jest
          .fn()
          .mockImplementation(
            (matcher: {
              [Symbol.match](string: string): RegExpMatchArray | null;
            }): RegExpMatchArray | null => {
              const match = "2...3".match(matcher);
              if (match !== null && match.groups) {
                match.groups.from = "";
              }
              return match;
            }
          ),
      };
      ensure("slice").throwsInternalError([value as string]);
    });
  });

  //
  // getInputs()
  //

  describe.each([
    [
      {
        name: "with minimal config",

        config: {
          token: "",
          owner: "octokit",
          repo: "hello-world",
          per_page: "",
          max_entries: "",
          name: "",
          tag_name: "",
          draft: "",
          prerelease: "",
          sort: "",
          order: "",
          slice: "",
          select: "",
        } as ActionInputs,

        output: {
          token: null,
          owner: "octokit",
          repo: "hello-world",
          per_page: undefined,
          max_entries: null,
          name: null,
          tag_name: null,
          draft: null,
          prerelease: null,
          sort: null,
          order: "A",
          slice: { type: "A" },
          select: null,
        },
      },
    ],
    [
      {
        name: "with complete config",

        config: {
          token: "$3Cret",
          owner: "octokit",
          repo: "hello-world",
          per_page: "3",
          max_entries: "12",
          name: "v5.3.1",
          tag_name: "5.3.1",
          draft: "true",
          prerelease: "false",
          sort: "id, draft ASC",
          order: "DSC",
          slice: "2 ... 9",
          select: " name, id ",
        } as ActionInputs,

        output: {
          token: "$3Cret",
          owner: "octokit",
          repo: "hello-world",
          per_page: 3,
          max_entries: 12,
          name: "v5.3.1",
          tag_name: "5.3.1",
          draft: true,
          prerelease: false,
          sort: [
            ["id", "D"],
            ["draft", "A"],
          ],
          order: "D",
          slice: { type: "R", from: 2, to: 9 },
          select: ["name", "id"],
        },
      },
    ],
    [
      {
        name: 'with regular expressions in "name" & "tag_name" and some wildcards',

        config: {
          token: "$3Cret",
          owner: "octokit",
          repo: "hello-world",
          per_page: "3",
          max_entries: "12",
          name: "/^v?\\d+\\.\\d+\\.\\d+$/",
          tag_name: "/^\\d+\\.\\d+\\.\\d+$/",
          draft: "*",
          prerelease: "*",
          sort: "",
          order: "",
          slice: "",
          select: "name id",
        } as ActionInputs,

        output: {
          token: "$3Cret",
          owner: "octokit",
          repo: "hello-world",
          per_page: 3,
          max_entries: 12,
          name: /^v?\d+\.\d+\.\d+$/,
          tag_name: /^\d+\.\d+\.\d+$/,
          draft: null,
          prerelease: null,
          sort: null,
          order: "A",
          slice: { type: "A" },
          select: ["name", "id"],
        },
      },
    ],
  ])(".getInputs()", ({ name, config, output }) => {
    function isValidKey(key: string): key is keyof ActionInputs {
      return key in config;
    }
    it(`${name}`, () => {
      expect.assertions(1);
      const spy = jest.spyOn(core, "getInput").mockImplementation((key) => {
        if (isValidKey(key)) {
          return config[key];
        } else {
          return "";
        }
      });
      expect(getInputs()).toStrictEqual(output);
      spy.mockRestore();
    });
  });
});

// vim: set ts=2 sw=2 sts=2:
