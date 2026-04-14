import { useCallback, useEffect, useRef, useState } from "react";
import type { FetchState } from "@/types";

interface UseFetchOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface InternalState<T> {
  data: T | null;
  error: string | null;
  fetchId: number;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {},
): FetchState<T> & { refetch: () => void; lastUpdated: Date | null } {
  const { refreshInterval, enabled = true } = options;
  const [internal, setInternal] = useState<InternalState<T>>({
    data: null,
    error: null,
    fetchId: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [settledId, setSettledId] = useState(-1);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const currentFetchId = internal.fetchId;

    fetcherRef.current().then(
      (data) => {
        if (!cancelled) {
          setInternal((prev) => ({ ...prev, data, error: null }));
          setSettledId(currentFetchId);
          setLastUpdated(new Date());
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setInternal((prev) => ({ ...prev, error: message }));
          setSettledId(currentFetchId);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, internal.fetchId]);

  useEffect(() => {
    if (!enabled || !refreshInterval) return;
    const interval = setInterval(() => {
      setInternal((prev) => ({ ...prev, fetchId: prev.fetchId + 1 }));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [enabled, refreshInterval]);

  const refetch = useCallback(() => {
    setInternal((prev) => ({ ...prev, fetchId: prev.fetchId + 1 }));
  }, []);

  const loading = enabled && settledId < internal.fetchId;

  return {
    data: internal.data,
    loading,
    error: internal.error,
    refetch,
    lastUpdated,
  };
}
