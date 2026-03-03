import { WorkSerializable } from "../db-typeorm/serializable";
import { useNumMintedDb } from "./useNumMintedDb";

export const useSoldOut = (work: WorkSerializable | null | undefined) => {
  const numMintedQuery = useNumMintedDb(work?.slug);
  const isSoldOut =
    typeof numMintedQuery.data === "number" &&
    typeof work?.maxTokens === "number"
      ? numMintedQuery.data >= work.maxTokens
      : false;
  return {
    data: isSoldOut,
    isLoading: numMintedQuery.isLoading,
    isError: numMintedQuery.isError,
  };
};
