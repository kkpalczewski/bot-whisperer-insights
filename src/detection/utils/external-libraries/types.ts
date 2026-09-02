import type { LibraryDependency } from "@/detection/config/ruleSchema";

export type { LibraryDependency };

const pending: Partial<Record<LibraryDependency, Promise<unknown>>> = {};

/**
 * Caches the in-flight promise for a library so concurrent callers share one
 * initialisation. A failed initialisation is evicted so a later call can retry.
 */
export function cachedLibrary<T>(
  key: LibraryDependency,
  init: () => Promise<T>
): Promise<T> {
  if (!pending[key]) {
    pending[key] = init().catch((error) => {
      delete pending[key];
      throw error;
    });
  }
  return pending[key] as Promise<T>;
}
