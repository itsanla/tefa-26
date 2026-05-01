import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/services/api.service";

type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export function usePaginatedApi<T>(endpoint: string, deps: any[] = []) {
  const [pages, setPages] = useState<Record<number, T[]>>({});
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchingRef = useRef<Set<number>>(new Set());

  const fetchPage = useCallback(
    async (targetPage: number, isPrefetch = false) => {
      if (fetchingRef.current.has(targetPage)) return;

      fetchingRef.current.add(targetPage);
      if (!isPrefetch) setLoading(true);

      try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const response = (await apiRequest({
          endpoint: `${endpoint}${separator}page=${targetPage}`,
          returnFullResponse: true,
        })) as PaginatedResponse<T>;

        const pageData = Array.isArray(response?.data) ? response.data : [];
        setPages((current) => ({ ...current, [targetPage]: pageData }));

        // Always update meta to ensure we have totalPages info
        if (response?.meta) {
          setMeta(response.meta);
        }
      } finally {
        fetchingRef.current.delete(targetPage);
        if (!isPrefetch) setLoading(false);
      }
    },
    [endpoint],
  );

  const refresh = useCallback(
    (targetPage?: number) => {
      setPages({});
      fetchingRef.current.clear();
      if (targetPage && targetPage !== page) {
        setPage(targetPage);
      } else {
        setRefreshKey((current) => current + 1);
      }
    },
    [page],
  );

  useEffect(() => {
    setPages({});
    setMeta(null);
    setPage(1);
    fetchingRef.current.clear();
  }, [endpoint, ...deps]);

  useEffect(() => {
    const currentPages = pages;
    const currentMeta = meta;

    // Fetch current page if not cached
    if (!currentPages[page] && !fetchingRef.current.has(page)) {
      fetchPage(page, false);
    }

    // Prefetch next page if not cached and within bounds
    if (currentMeta && page < currentMeta.totalPages) {
      const nextPage = page + 1;
      if (!currentPages[nextPage] && !fetchingRef.current.has(nextPage)) {
        setTimeout(() => {
          if (!fetchingRef.current.has(nextPage)) {
            fetchPage(nextPage, true);
          }
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, meta, refreshKey]);

  return {
    data: pages[page] ?? [],
    meta,
    page,
    setPage,
    loading,
    refresh,
  };
}
