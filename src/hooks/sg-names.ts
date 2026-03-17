export function useWalletName(address: string) {
  return {
    data: "",
    isLoading: false,
    isError: false,
  };
}

export function useNameInfo(name: string) {
  return {
    data: null,
    isLoading: false,
    isError: false,
  };
}

export function useProfileInfo({ address }: { address?: string }) {
  return {
    walletName: "",
    textRecords: undefined as
      | undefined
      | { name: string; value: string; verified: boolean }[],
    isLoading: false,
  };
}
