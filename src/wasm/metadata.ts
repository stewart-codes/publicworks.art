import { NftMetadata } from "../hooks/useNftMetadata";

export async function fetchTokenUriInfo(tokenUri: string) {
  // Some artists have a double slash, so we need to clean it
  // https://stackoverflow.com/questions/40649382/how-to-replace-double-multiple-slash-to-single-in-url
  tokenUri = tokenUri.replace(/(https?:\/\/)|(\/)+/g, "$1$2");

  const response = await fetch(tokenUri);

  if (!response.ok) throw Error("Failed to fetch URI: " + tokenUri);
  const textNftInfo = await response.text();
  let nftInfo;
  try {
    nftInfo = JSON.parse(textNftInfo);
  } catch (e) {
    throw new Error("bad json");
  }

  // Replace IPFS links for browsers that don't support them
  nftInfo.image = getImageUri(nftInfo.image);
  nftInfo.animation_url = getAnimationUri(nftInfo.animation_url);
  const url = process.env.NEXT_PUBLIC_CDN;
  nftInfo.imageCdn = normalizeIpfsCdnUri(nftInfo.image);

  return nftInfo as NftMetadata;
}

export function normalizeMetadataUri(ipfsUri: string, ipfsHost?: string) {
  return ipfsUri.replace(
    /ipfs:\/\//i,
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || ipfsHost || `https://ipfs.io/ipfs/`
  );
}

export function normalizeIpfsUri(ipfsUri: string) {
  return ipfsUri.replace(
    /ipfs:\/\//i,
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/"
  );
}

export function normalizeIpfsCdnUri(ipfsUri: string) {
  return ipfsUri.replace(
    /ipfs:\/\//i,
    (process.env.NEXT_PUBLIC_IMAGES_CDN ||
      "https://metadata.publicworks.art/images") + "/"
  );
}

export function normalizeIpfsAnimationUri(ipfsUri: string) {
  return ipfsUri.replace(
    /ipfs:\/\//i,
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/"
  );
}

export function getImageUri(ipfsUri: string, queryArgs = "") {
  return `${normalizeIpfsCdnUri(ipfsUri)}${queryArgs}`;
}

export function getAnimationUri(ipfsUri: string, queryArgs = "") {
  return `${normalizeIpfsUri(ipfsUri)}${queryArgs}`;
}

export function getMetadataBaseUrl() {
  return process.env.NEXT_PUBLIC_TESTNET === "true"
    ? "https://testnet-metadata.publicworks.art"
    : "https://metadata.publicworks.art";
}

export const getTokenMetadataFromApi = async (
  workId: number,
  tokenId: string
): Promise<NftMetadata | null> => {
  const baseUrl = getMetadataBaseUrl();
  const res = await fetch(`${baseUrl}/${workId}/${tokenId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text();
    if (text.includes("not found")) return null;
    throw new Error("Failed to fetch token metadata");
  }
  const nftInfo = await res.json();
  nftInfo.image = getImageUri(nftInfo.image);
  nftInfo.animation_url = getAnimationUri(nftInfo.animation_url);
  nftInfo.imageCdn = normalizeIpfsCdnUri(nftInfo.image);
  return nftInfo as NftMetadata;
};

export const getTokenMetadata = async (
  workId: number,
  tokenId: string
): Promise<NftMetadata | null> => {
  return getTokenMetadataFromApi(workId, tokenId);
};
