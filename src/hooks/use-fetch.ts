import { useCallback, useEffect, useRef, useState } from "react";
import type { FetchState } from "@/types";

interface UseFetchOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {},
): FetchState<T> & { refetch: () => void; lastUpdated: Date | null } {
  const { refreshInterval, enabled = true } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    execute();
  }, [enabled, execute]);

  useEffect(() => {
    if (!enabled || !refreshInterval) return;
    const interval = setInterval(execute, refreshInterval);
    return () => clearInterval(interval);
  }, [enabled, refreshInterval, execute]);

  return { ...state, refetch: execute, lastUpdated };
}
