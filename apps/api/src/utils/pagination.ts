export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

type PaginationQuery = Record<string, string | undefined>;

type PaginationParams = {
  search: string;
  page: number;
  pageSize: number;
  offset: number;
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function parsePagination(query: PaginationQuery): PaginationParams {
  const rawPage = Number(query.page ?? "1");
  const rawSize = Number(query.pageSize ?? query.limit ?? DEFAULT_PAGE_SIZE);

  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize > 0
      ? Math.min(Math.floor(rawSize), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  const search = query.search ?? "";

  return {
    search,
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return { page, pageSize, totalItems, totalPages };
}
