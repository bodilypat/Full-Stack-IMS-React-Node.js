/* File: #src/utils/pagination.js */ 

const sanitizePositiveInt = (value, fallback) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

export const getPagination = (page = 1, limit = 20) => {
  const currentPage = Math.max(sanitizePositiveInt(page, 1), 1);
  const pageSize = Math.min(Math.max(sanitizePositiveInt(limit, 20), 1), 100);
  const offset = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    limit: pageSize,
    offset,
  };
};

export const getPaginationMeta = ({
  page = 1,
  limit = 20,
  total = 0,
}) => {
  const safePage = Math.max(sanitizePositiveInt(page, 1), 1);
  const safeLimit = Math.min(Math.max(sanitizePositiveInt(limit, 20), 1), 100);
  const safeTotal = Math.max(Number(total) || 0, 0);
  const totalPages = safeLimit > 0 ? Math.max(Math.ceil(safeTotal / safeLimit), 0) : 0;

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1 && safeTotal > 0,
  };
};
