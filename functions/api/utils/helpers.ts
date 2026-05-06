import { eq } from "drizzle-orm";

export const formatLinks = (c: any, path: string, id?: string) => {
  const baseUrl = new URL(c.req.url).origin + "/api/v1";
  const self = id ? `${baseUrl}${path}/${id}` : `${baseUrl}${path}`;
  return {
    self,
    collection: id ? `${baseUrl}${path}` : undefined,
  };
};

export const createPaginatedResponse = (
  items: any[],
  total: number,
  page: number,
  limit: number,
  links: any
) => {
  const pages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages,
      has_next: page < pages,
      has_prev: page > 1,
    },
    _links: links,
  };
};

export const invalidateHomeCache = async (db: any, schema: any) => {
  try {
    await db.delete(schema.systemCache).where(eq(schema.systemCache.key, "home_bulk"));
  } catch (err) {
    console.error("Cache Invalidation Error:", err);
  }
};
