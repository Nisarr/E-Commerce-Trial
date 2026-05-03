import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../backend/server/db/schema";

export type Bindings = {
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
  ADMIN_API_KEY: string;
};

export type Variables = {
  db: LibSQLDatabase<typeof schema>;
};

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
