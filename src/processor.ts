import {
  Release,
  SafeInputs,
  SortSpecs,
  SortSpec,
  SelectSpecs,
  SliceSpec,
} from "./types";

import { pick } from "./pick";

type Comparable = "name" | "tag_name" | "draft" | "prerelease";
const comparable: Comparable[] = ["name", "tag_name", "draft", "prerelease"];
interface FilterTest {
  (entry: Release): boolean;
}

export class Filter {
  static compare(value: string, expect: RegExp | string): boolean;
  static compare(value: unknown, expect: unknown): boolean;
  static compare(value: unknown, expect: unknown): boolean {
    if (
      typeof value === "string" &&
      (typeof expect === "string" ||
        (typeof expect === "object" && expect instanceof RegExp))
    ) {
      return Filter.match(value, expect);
    } else {
      return Filter.same(value, expect);
    }
  }

  tests: FilterTest[];

  static match(value: string, expect: RegExp | string): boolean {
    return expect instanceof RegExp ? expect.test(value) : value === expect;
  }

  static same(value: unknown, expect: unknown): boolean {
    return value === expect;
  }

  static makeTests(inputs: SafeInputs): FilterTest[] {
    return comparable
      .filter((key) => inputs[key] != null)
      .map(
        (key) => (entry: Release) => Filter.compare(entry[key], inputs[key])
      );
  }

  constructor(inputs: SafeInputs) {
    this.tests = Filter.makeTests(inputs);
  }

  get callback() {
    return (entry: Release): boolean => {
      return this.tests.reduce(
        (acc: boolean, test: FilterTest) => acc && test(entry),
        true
      );
    };
  }

  filter(entries: Release[]): Release[] {
    return entries.filter(this.callback);
  }
}

export class Sorter {
  sort: (entries: Release[]) => Release[];

  constructor(sort?: SortSpecs) {
    if (sort == null) {
      this.sort = (entries) => entries;
    } else {
      this.sort = (entries) => entries.sort(Sorter.callback(sort));
    }
  }

  static cmp(left: unknown, right: unknown): number {
    function isNumeric(arg: unknown): arg is boolean | number {
      return ["boolean", "number"].includes(typeof arg);
    }

    // nulls and undefined values shall be moved to the end
    for (const special of [undefined, null]) {
      if (left === special && right === special) {
        return 0;
      } else if (left === special) {
        return 1;
      } else if (right === special) {
        return -1;
      }
    }

    if (isNumeric(left) && isNumeric(right)) {
      return Math.sign((left as number) - (right as number));
    }

    return Object(left).toString().localeCompare(Object(right).toString());
  }

  static callback(
    sort: SortSpecs
  ): ((le: Release, re: Release) => number) | undefined {
    if (sort == null) {
      return undefined;
    } else {
      return (le: Release, re: Release) =>
        sort
          .map(([key, ord]: SortSpec) =>
            ord === "D" ? [re[key], le[key]] : [le[key], re[key]]
          )
          .reduce(
            (result, [left, right]) =>
              result === 0 ? Sorter.cmp(left, right) : result,
            0
          );
    }
  }
}

export class Selector {
  select: (entries: Release[]) => Partial<Release>[];
  constructor(keys: SelectSpecs) {
    if (keys == null) {
      this.select = (entries) => entries;
    } else {
      this.select = (entries) => entries.map(Selector.callback(keys));
    }
  }

  static callback(keys: SelectSpecs): (entry: Release) => Partial<Release> {
    if (keys == null) {
      return (entry: Release) => entry;
    } else {
      return (entry: Release) => pick(entry, keys);
    }
  }
}

interface SlicerMethod {
  <T>(arr: T[]): T[];
}

export class Slicer {
  slice: SlicerMethod;

  constructor(slice: SliceSpec) {
    this.slice = Slicer.method(slice);
  }

  static method(slice: SliceSpec): SlicerMethod {
    const count = (s: SliceSpec) =>
      (s.type !== "F" && s.type !== "L") || s.count == null ? 1 : s.count;
    const from = (s: SliceSpec) =>
      s.type !== "R" || s.from == null ? 0 : s.from;
    const to = (s: SliceSpec) =>
      s.type !== "R" || s.to == null ? undefined : 1 + s.to;

    if (slice == null) {
      return <T>(arr: T[]) => arr;
    }

    switch (slice.type) {
      case "F":
        return <T>(arr: T[]) => arr.slice(0, count(slice));
      case "L":
        return <T>(arr: T[]) =>
          arr.slice(arr.length - count(slice), arr.length);
      case "R":
        return <T>(arr: T[]) => arr.slice(from(slice), to(slice));
      default:
        return <T>(arr: T[]) => arr;
    }
  }
}

export class Processor {
  filter: Filter;
  sorter: Sorter;
  selector: Selector;
  slicer: Slicer;

  constructor(inputs: SafeInputs) {
    this.filter = new Filter(inputs);
    this.sorter = new Sorter(inputs.sort);
    this.selector = new Selector(inputs.select);
    this.slicer = new Slicer(inputs.slice);
  }

  process(entries: Release[]): Partial<Release>[] {
    return this.slicer.slice(
      this.selector.select(this.sorter.sort(this.filter.filter(entries)))
    );
  }
}

// vim: set ts=2 sw=2 sts=2:
