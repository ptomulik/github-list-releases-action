"use strict";

class Filter {

  static makeTests(inputs) {
    return [... Filter.comparators].filter(
      ([key, comparator]) => inputs[key] != null
    ).map(
      ([key, comparator]) => (entry) => comparator(entry[key], inputs[key])
    );
  }

  constructor(inputs) {
    this.tests = Filter.makeTests(inputs);
  }

  get callback() {
    return (entry) => this.tests.reduce(
      (result, test) => (result && test(entry)),
      true
    );
  }

  filter(entries) {
    return entries.filter(this.callback);
  }
}

Filter.match = (value, expect) => (
    (expect instanceof RegExp) ? expect.test(value) : value === expect
);

Filter.same = (value, expect) => (value === expect);

Filter.comparators = new Map([
  ['name',       Filter.match],
  ['tag_name',   Filter.match],
  ['draft',      Filter.same],
  ['prerelease', Filter.same],
]);

class Sorter {
  constructor(sort) {
    if (sort == null) {
      this.sort = (entries) => entries;
    } else {
      this.sort = (entries) => entries.sort(Sorter.callback(sort));
    }
  }

  static cmp(left, right) {
    // undefined shall be moved to the end
    if (left === undefined && right === undefined) {
      return  0;
    } else if (left === undefined) {
      return  1;
    } else if (right === undefined) {
      return -1;
    }

    const leftType = typeof left;
    const rightType = typeof right;
    const numTypes = ['boolean', 'number'];

    if (numTypes.includes(leftType) && numTypes.includes(rightType)) {
      return Math.sign(left - right);
    }

    return Object(left).toString().localeCompare(Object(right).toString());
  }

  static callback(sort) {
    if (sort == null) {
      return undefined;
    } else {
      const tuples = sort.map((s) => ((s instanceof Array) ? s : [s, 'A']));
      return (le, re) => tuples.map(([key, ord]) => (
        (ord === 'D') ? [re[key], le[key]] : [le[key], re[key]]
      )).reduce((result, [left, right]) => (
        (result === 0) ? Sorter.cmp(left, right) : result
      ), 0);
    }
  }
}

class Selector {
  constructor(keys) {
    if (keys == null) {
      this.select = (entries) => entries;
    } else {
      this.select = (entries) => entries.map(Selector.callback(keys));
    }
  }

  static callback(keys) {
    if (keys == null) {
      return (entry) => entry;
    } else {
      return (entry) => keys.reduce(
        (obj, k) => { obj[k] = entry[k]; return obj; }, {}
      );
    }
  }
}

class Slicer {
  constructor(slice) {
    this.slice = Slicer.method(slice);
  }

  static method(slice) {
    const count = (s) => ((s.count == null) ?  1 : s.count);
    const from  = (s) => ((s.from == null) ? 0 : s.from);
    const to    = (s) => ((s.to == null) ? undefined : 1 + s.to);

    if (slice == null) {
      return (arr) => arr;
    }

    switch(slice.type) {
      case 'F':
        return Slicer.first(count(slice));
      case 'L':
        return (arr) => arr.slice(arr.length - count(slice), arr.length);
      case 'R':
        return (arr) => arr.slice(from(slice), to(slice));
      default:
        return (arr) => arr;
    }
  }

  static first(count) {
    return (arr) => arr.slice(0, count);
  }

  static last(count) {
    return (arr) => {
      const n = arr.length;
      return arr.slice(n - count, n);
    };
  }

  static range(from, to) {
    return (arr) => (
      (to == null) ?  arr.slice(from) : arr.slice(from, 1 + to)
    );
  }
}

class Processor {
  constructor(inputs) {
    this.filter = new Filter(inputs);
    this.sorter = new Sorter(inputs.sort);
    this.selector = new Selector(inputs.select);
    this.slicer = new Slicer(inputs.slice);
  }

  process(entries) {
    return this.slicer.slice(
      this.selector.select(
        this.sorter.sort(
          this.filter.filter(entries)
        )
      )
    );
  }
}

module.exports = { Filter, Sorter, Selector, Slicer, Processor };
