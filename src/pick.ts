export function pick<T, K extends keyof T>(record: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, key) => (key in record ? (acc[key] = record[key]) : null, acc),
    {} as Pick<T, K>
  );
}

// vim: set ts=2 sw=2 sts=2:
