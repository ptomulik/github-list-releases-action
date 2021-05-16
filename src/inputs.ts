/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

import * as core from "@actions/core";

import {
  NameSpec,
  OrderSpec,
  SafeInputs,
  Selectable,
  SelectSpecs,
  SliceSpec,
  SortSpec,
  SortSpecs,
  Sortable,
} from "./types";

export interface ValidateMethods {
  stringOrRegexp(value: string): RegExp | string | null;
  intOrNull(value: string, key: string): number | null;
  bool(value: string, key: string): boolean | null;
  testWithRegExp(re: RegExp, value: string, key: string): string;
  token(value: string): string | null;
  owner(value: string): string;
  repo(value: string): string;
  per_page(value: string): number | undefined;
  max_entries(value: string): number | null;
  name(value: string): NameSpec;
  tag_name(value: string): NameSpec;
  draft(value: string): boolean | null;
  prerelease(value: string): boolean | null;
  sort(value: string, defaultOrder: OrderSpec): SortSpecs;
  order(value: string): OrderSpec;
  select(value: string): SelectSpecs;
  slice(value: string): SliceSpec;
}

export interface Validate extends ValidateMethods {
  sortable: Sortable[];
  selectable: Selectable[];
}

export interface ActionInputs {
  token: string;
  owner: string;
  repo: string;
  name: string;
  per_page: string;
  max_entries: string;
  tag_name: string;
  draft: string;
  prerelease: string;
  sort: string;
  order: string;
  select: string;
  slice: string;
}

export class ValidationError extends Error {
  static make(key: string, value: unknown): ValidationError {
    return new ValidationError(
      `validation failed for input ${key}: ${JSON.stringify(value)}`
    );
  }
}

export class InternalError extends Error {}

export const validate: Validate = {
  sortable: [
    "url",
    "assets_url",
    "upload_url",
    "html_url",
    "id",
    "node_id",
    "tag_name",
    "target_commitish",
    "name",
    "draft",
    "prerelease",
    "created_at",
    "published_at",
    "tarball_url",
    "zipball_url",
    "body",
    "body_html",
    "body_text",
  ],

  selectable: [
    "url",
    "assets_url",
    "upload_url",
    "html_url",
    "id",
    "author",
    "node_id",
    "tag_name",
    "target_commitish",
    "name",
    "draft",
    "prerelease",
    "created_at",
    "published_at",
    "assets",
    "tarball_url",
    "zipball_url",
    "body",
    "body_html",
    "body_text",
  ],

  stringOrRegexp(value: string): RegExp | string | null {
    const re = /^(?:\/(.*)\/([a-z]*))$/;
    const match = value.match(re);
    if (match) {
      return new RegExp(match[1], match[2]);
    }
    return ["", "*"].includes(value) ? null : value;
  },

  intOrNull(value: string, key: string): number | null {
    const re = /^\s*(\d+|)\s*$/;
    const match = value.match(re);
    if (!match) {
      throw ValidationError.make(key, value);
    }
    return match[1] ? parseInt(match[1]) : null;
  },

  bool(value: string, key: string): boolean | null {
    if (value === "" || value === "*") {
      return null;
    } else if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    } else {
      throw ValidationError.make(key, value);
    }
  },

  testWithRegExp(re: RegExp, value: string, key: string): string {
    if (!re.test(value)) {
      throw ValidationError.make(key, value);
    }
    return value;
  },

  token(value: string): string | null {
    return value ? value : null;
  },

  owner(value: string): string {
    const re = /^(?:[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
    return validate.testWithRegExp(re, value, "owner");
  },

  repo(value: string): string {
    const re = /^(?:(?:\.?[_a-z\d-][_a-z\d.-]*)|(?:.\.[_a-z\d.-]+))$/i;
    return validate.testWithRegExp(re, value, "repo");
  },

  per_page(value: string): number | undefined {
    const num = validate.intOrNull(value, "per_page");
    if (num != null && num > 100) {
      throw ValidationError.make("per_page", value);
    }
    return num != null ? num : undefined;
  },

  max_entries(value: string): number | null {
    return validate.intOrNull(value, "max_entries");
  },

  name(value: string): NameSpec {
    return validate.stringOrRegexp(value);
  },

  tag_name(value: string): NameSpec {
    return validate.stringOrRegexp(value);
  },

  draft(value: string): boolean | null {
    return validate.bool(value, "draft");
  },

  prerelease(value: string): boolean | null {
    return validate.bool(value, "prerelease");
  },

  sort(value: string, defaultOrder: OrderSpec = "A"): SortSpecs {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const re = new RegExp(
      `^(${validate.sortable.join(
        "|"
      )})(?:(?:\\s+|\\s*=\\s*)(A(?:SC)?|D(?:E?SC)?))?$`,
      "i"
    );
    const sep = /\s*,\s*/;
    const strings = trimmed.split(sep);

    const fields: SortSpec[] = [];
    for (const string of strings) {
      const match = string.match(re);
      if (!match) {
        throw ValidationError.make("sort", value);
      }
      const key = match[1].toLowerCase() as Sortable;
      const ord = (match[2] ? match[2] : defaultOrder)
        .toUpperCase()
        .substring(0, 1) as OrderSpec;
      fields.push([key, ord]);
    }
    return fields;
  },

  order(value: string): OrderSpec {
    const re = /^\s*(A(?:SC)?|D(?:E?SC)?|)\s*$/i;
    const match = value.match(re);

    if (!match) {
      throw ValidationError.make("order", value);
    }

    return (match[1] ? match[1] : "A")
      .toUpperCase()
      .substring(0, 1) as OrderSpec;
  },

  select(value: string): SelectSpecs {
    const isSelectable = (key: string): key is Selectable => {
      return validate.selectable.includes(key as Selectable);
    };

    const allSelectable = (keys: string[]): keys is Selectable[] => {
      const invalid = keys.filter((s) => !isSelectable(s));
      return invalid.length === 0;
    };

    const trimmed = value.trim();

    if (!trimmed || trimmed === "*") {
      return null;
    }

    const sep = /(?:\s*,\s*)|\s+/;
    const keys = trimmed.split(sep);

    if (allSelectable(keys)) {
      return keys;
    }

    throw ValidationError.make("select", value);
  },

  slice(value: string): SliceSpec {
    const re = new RegExp(
      "^\\s*(" +
        "(?:(?<all>A)(?:LL)?)" +
        "|" +
        "(?:(?:(?:(?<first>F)(?:I?RST)?)|(?:(?<last>L)(?:AST)?))(?:(?:\\s+|\\s*=\\s*)(?<count>\\d+))?)" +
        "|" +
        "(?:(?<from>\\d+)\\s*\\.\\.\\.\\s*(?<to>\\d+|))" +
        "|" +
        "" +
        ")\\s*$",
      "i"
    );
    const match = value.match(re);

    if (!match) {
      throw ValidationError.make("slice", value);
    }

    const groups = match.groups;

    if (groups) {
      if (!match[1] || groups.all) {
        return { type: "A" };
      }

      for (const type of [groups.first, groups.last]) {
        if (type) {
          const count = groups.count;
          return {
            type: type.toUpperCase() as "F" | "L",
            count: count ? parseInt(count) : 1,
          };
        }
      }

      if (groups.from) {
        return {
          type: "R",
          from: parseInt(groups.from),
          to: groups.to ? parseInt(groups.to) : null,
        };
      }
    }

    /* istanbul ignore next */
    throw new InternalError(`slice: ${JSON.stringify(value)}`);
  },
};

export const getInputs = (): SafeInputs => {
  const order = validate.order(core.getInput("order"));
  return {
    token: validate.token(core.getInput("token")),
    owner: validate.owner(core.getInput("owner")),
    repo: validate.repo(core.getInput("repo")),
    name: validate.name(core.getInput("name")),
    per_page: validate.per_page(core.getInput("per_page")),
    max_entries: validate.max_entries(core.getInput("max_entries")),
    tag_name: validate.tag_name(core.getInput("tag_name")),
    draft: validate.draft(core.getInput("draft")),
    prerelease: validate.prerelease(core.getInput("prerelease")),
    sort: validate.sort(core.getInput("sort"), order),
    order,
    slice: validate.slice(core.getInput("slice")),
    select: validate.select(core.getInput("select")),
  };
};

// vim: set ts=2 sw=2 sts=2:
