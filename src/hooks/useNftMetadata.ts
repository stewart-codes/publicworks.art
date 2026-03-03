import { getTokenMetadataFromApi } from "../wasm/metadata";
import { useQuery } from "@tanstack/react-query";

export interface Attribute {
  value: string | number | boolean | null;
  trait_type: string;
}

export interface NftMetadata {
  tokenId: string | undefined;
  animation_url: string | undefined;
  description: string;
  image: string;
  imageCdn: string;
  attributes: Attribute[] | undefined;
  traits: Attribute[] | undefined;
  name: string | undefined;
  creator: string | undefined;
  resolution: string | undefined;
}

export const useNftMetadata = ({
  workId,
  tokenId,
  refresh,
}: {
  workId: number | undefined | null;
  tokenId: string | undefined | null;
  refresh?: boolean;
}) => {
  const query = useQuery({
    queryKey: ["nftMetadata", workId, tokenId],
    queryFn: async () => {
      if (!workId || !tokenId) {
        return null;
      }
      return getTokenMetadataFromApi(workId, tokenId);
    },
    enabled: !!workId && !!tokenId,
    refetchOnMount: !!refresh,
    refetchOnWindowFocus: !!refresh,
    refetchOnReconnect: !!refresh,
  });

  return query;
};
