export const useTokenOwner = ({
  sg721,
  tokenId,
}: {
  sg721?: string | null;
  tokenId?: string | null;
}) => {
  return {
    owner: undefined,
    loading: false,
    error: null,
  };
};
