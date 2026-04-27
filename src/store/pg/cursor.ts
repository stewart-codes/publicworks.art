// src/repository/pg/cursor.ts
export const encodeCursor = (data: object): string =>
  Buffer.from(JSON.stringify(data)).toString("base64");

export const decodeCursor = <T>(cursor: string): T =>
  JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as T;
