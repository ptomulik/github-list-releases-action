import { inspect } from "util";

export function repr(value: unknown): string {
  return inspect(value, {
    compact: true,
    breakLength: Infinity,
  });
}

// vim: set ts=2 sw=2 sts=2:
