import { useNumMintedDb } from "./useNumMintedDb";

export const useNumMintedOnChain = (
  slug: string | null | undefined,
  refreshInterval?: number
) => {
  return useNumMintedDb(slug, refreshInterval);
};
