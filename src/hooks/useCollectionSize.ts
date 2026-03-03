import { useQuery } from "@tanstack/react-query";

export const useCollectionSize = (maxTokens: number | undefined | null) => {
  const query = useQuery({
    queryKey: ["collectionSize", maxTokens],
    queryFn: async () => {
      return maxTokens ?? 0;
    },
    enabled: maxTokens != null,
  });

  return query;
};

//alias
export const useNumberMinted = useCollectionSize;
