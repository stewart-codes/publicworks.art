import { trpcNextPW } from "../../server/utils/trpc";

export const useIndexerStatus = () => {
  return trpcNextPW.indexer.getLastSweptBlock.useQuery(null, {
    refetchInterval: 2000,
  });
};
