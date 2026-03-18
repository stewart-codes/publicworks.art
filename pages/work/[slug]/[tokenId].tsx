import { FieldControl } from "../../../src/components/control/FieldControl";
import { RowSquareContainer } from "../../../src/components/layout/RowSquareContainer";
import { RowThinContainer } from "../../../src/components/layout/RowThinContainer";
import { LiveMedia } from "../../../src/components/media/LiveMedia";
import { Attributes } from "../../../src/components/metadata/Attributes";
import { StarsAddressName } from "../../../src/components/name/StarsAddressName";
import { useTokenOwner } from "../../../src/hooks/useTokenOwner";
import MainLayout from "../../../src/layout/MainLayout";
import { cn } from "../../../src/lib/css/cs";
import { stores } from "../../../src/store/stores";
import {
  getTokenMetadataFromApi,
  normalizeIpfsCdnUri,
  normalizeIpfsUri,
  normalizeMetadataUri,
} from "../../../src/wasm/metadata";
import styles from "../../../styles/Work.module.scss";
import {
  serializeWork,
  serializeWorkToken,
  TokenSerializable,
  TokenSerializableWithMetadata,
} from "../../../src/db-typeorm/serializable";
import { useQuery } from "@tanstack/react-query";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useMemo, useState } from "react";
import { Button, Container } from "react-bootstrap";
import SpinnerLoading from "src/components/loading/Loader";
import { trpcNextPW } from "src/server/utils/trpc";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

export async function getStaticPaths() {
  console.log("getStaticPaths, token");
  const out: { params: { slug: string; tokenId: string } }[] = [];
  let i = 0;
  const getPublishedTokens = async () => {
    const works = await stores().project.getProjects({
      limit: 100,
      publishedState: "PUBLISHED",
      includeHidden: false,
    });

    for (const work of works.items) {
      const tokens = await stores().project.getProjectTokens2({
        workId: work.id,
        limit: 500,
        publishedState: "PUBLISHED",
      });

      out.push(
        ...tokens.items.map((s) => {
          return { params: { slug: work.slug, tokenId: s.token_id } };
        })
      );
      if (out.length >= 500) {
        return;
      }
      i++;
    }
    return out;
  };
  await getPublishedTokens();
  console.log("getProjectTokens, make", i, "calls");

  console.log("getStaticPaths, token, done");
  return {
    paths: out,
    fallback: "blocking",
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug;
  const tokenId = context.params?.tokenId;
  if (typeof slug !== "string" || typeof tokenId !== "string") {
    return {
      notFound: true,
    };
  }
  const work = await stores().project.getProjectBySlug(slug);
  if (!work) {
    return {
      notFound: true,
    };
  }

  const token = await stores().project.getToken({ workId: work.id, tokenId });

  const tokenSerialized: TokenSerializable | null = token
    ? {
        ...serializeWorkToken(token),
        imageUrl: token.imageUrl ? normalizeIpfsCdnUri(token.imageUrl) : "",
        metadataUri: token.metadataUri
          ? normalizeMetadataUri(token.metadataUri)
          : "",
      }
    : null;
  return {
    props: {
      slug,
      token: tokenSerialized,
      work: serializeWork(work),
      tokenId,
    },
    revalidate: 10, // In seconds
    // fallback: "blocking",
  };
};

// Slugs that should default to showing the live view
const LIVE_VIEW_DEFAULT_SLUGS = ["helio"];

const WorkTokenPage = ({
  work,
  slug,
  token: tokenIn,
  tokenId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);
  const defaultToLive = LIVE_VIEW_DEFAULT_SLUGS.includes(slug);
  const [showLive, setShowLive] = useState(defaultToLive);

  const workQuery = trpcNextPW.works.getWorkBySlug.useQuery(
    { slug: slug?.toString() || "" },
    { enabled: !!slug }
  );

  const { data } = workQuery;
  work = data || work;

  const tokenMetadata = useQuery({
    queryKey: ["gettokenmetadata", slug, tokenId, work?.id],
    queryFn: async () => {
      if (
        !tokenId ||
        Array.isArray(tokenId) ||
        !Number.isFinite(parseInt(tokenId))
      ) {
        setNotFound(true);
        return null;
      }

      try {
        return getTokenMetadataFromApi(work.id, tokenId);
      } catch (e) {
        return null;
      }
    },
    enabled: !!work && !!slug && !!tokenId,
  });

  type Token = {
    image: string;
    // imageCdn: string;
    animationUrl: string;
    description: string;
    hash: string;
  };

  const token: Token | null = useMemo((): Token | null => {
    const tokenCast = tokenIn as TokenSerializableWithMetadata | null;
    if (tokenMetadata?.data) {
      return {
        image: normalizeIpfsCdnUri(tokenMetadata.data.image), //tokenMetadata.data.image,
        animationUrl: tokenMetadata.data.animation_url || "",
        description: tokenMetadata.data.description,
        hash: tokenCast?.hash || "",
        // imageCdn: tokenMetadata.data.imageCdn,
      };
    }
    if (!tokenCast) {
      return null;
    }

    return {
      image: normalizeIpfsCdnUri(tokenCast.imageUrl || ""), //tokenCast.imageUrl || "",
      // imageCdn: normalizeIpfsCdnUri(tokenCast.imageUrl || ""),
      animationUrl: tokenCast.metadataUri || "",
      description: work.description || "",
      hash: tokenCast.hash,
    };
  }, [tokenMetadata?.data, tokenIn, work.description]);

  const errorMetadata = tokenMetadata.isError;
  const {
    loading: ownerLoading,
    error,
    owner,
  } = useTokenOwner({ sg721: work?.sg721, tokenId: tokenId?.toString() });

  const notFoundActual =
    (!workQuery.isLoading && !workQuery.isSuccess && !workQuery.data) ||
    (!tokenMetadata.isLoading && !token) ||
    notFound;

  return (
    <>
      <div>
        <Container>
          {work ? (
            <Link href={`/work/${work?.slug}`} passHref>
              <span>{`<- Back to ${work?.slug}`}</span>
            </Link>
          ) : (
            <></>
          )}

          <RowSquareContainer>
            <div className={"tw-w-full tw-aspect-square tw-relative"}>
              {errorMetadata ? (
                <div>Something went wrong</div>
              ) : notFoundActual ? (
                <div>Not Found</div>
              ) : tokenMetadata.isLoading ? (
                <div
                  className={
                    "tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
                  }
                >
                  <SpinnerLoading />
                </div>
              ) : showLive && tokenMetadata?.data?.animation_url ? (
                <LiveMedia
                  ipfsUrl={tokenMetadata.data.animation_url}
                  minHeight={500}
                  className={"tw-w-full tw-h-full tw-relative"}
                />
              ) : token?.image ? (
                <Image
                  src={token.image}
                  alt={"nft media"}
                  width={500}
                  height={500}
                  className={"tw-object-contain"}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <LiveMedia
                  ipfsUrl={tokenMetadata?.data?.animation_url || ""}
                  minHeight={500}
                  className={"tw-w-full tw-h-full tw-relative"}
                />
              )}
            </div>
            {tokenMetadata?.data?.animation_url && token?.image && (
              <div className={"mt-2"}>
                <Button
                  variant={showLive ? "outline-secondary" : "outline-primary"}
                  size="sm"
                  onClick={() => setShowLive((v) => !v)}
                >
                  {showLive ? "Show Image" : "View Live"}
                </Button>
              </div>
            )}
          </RowSquareContainer>
        </Container>
        <Container>
          <RowThinContainer
            className={`${styles.paddingTop} ${styles.workHeader}`}
          >
            <div className={styles.paddingTop}>
              <div className={"d-inline-flex align-items-center"}>
                <span className={styles.workTitle}>
                  {workQuery?.data?.name}
                </span>
                <span
                  className={cn(
                    styles.workAuthor,
                    "px-3 d-inline-flex align-items-center"
                  )}
                >
                  {!!workQuery?.data?.ownerAddress && (
                    <>
                      <span>By </span>
                      <StarsAddressName
                        address={workQuery?.data?.ownerAddress}
                        className={"inline"}
                      />
                    </>
                  )}
                </span>
              </div>
              {process.env.NEXT_PUBLIC_TESTNET === "true" ? (
                <div>** Showing Testnet Mints **</div>
              ) : (
                <></>
              )}

              {owner && (
                <div
                  className={`${styles.workAuthorLink} ${styles.displayLinebreak} ${styles.sectionBreak}`}
                >
                  {"Owned by: "}
                  <StarsAddressName address={owner} />
                </div>
              )}

              <div
                className={`${styles.displayLinebreak} ${styles.sectionBreak}`}
              >
                {token?.description}
              </div>
              <div
                className={`${styles.workAuthorLink} ${styles.sectionBreak}`}
              >
                {workQuery?.data?.externalLink ? (
                  <a
                    href={workQuery?.data?.externalLink}
                    rel="noreferrer"
                    target={"_blank"}
                  >
                    {workQuery?.data?.externalLink}
                  </a>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div>
              <h5 className={"mt-4"}>Metadata</h5>
              <FieldControl name={"Contract"}>
                {work.sg721 ? (
                  <StarsAddressName address={work.sg721} noShorten={false} />
                ) : null}
              </FieldControl>
              <FieldControl name={"Minter"}>
                {work.minter ? (
                  <StarsAddressName address={work.minter} noShorten={false} />
                ) : null}
              </FieldControl>
              <FieldControl name={"Hash"}>
                {token?.hash ? <>{token?.hash}</> : null}
              </FieldControl>
              <a
                href={tokenMetadata?.data?.image}
                className={"Token-link"}
                download={"true"}
              >
                Image
              </a>{" "}
              |{" "}
              <a
                href={tokenMetadata?.data?.animation_url}
                target={"_blank"}
                className={"Token-link"}
                rel="noreferrer"
              >
                Live
                <span className={"text-decoration-none"}>
                  {" "}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} width={16} />
                </span>
              </a>
            </div>
            <div className={"mt-4"}>
              <h4>Attributes</h4>
              {tokenMetadata.data?.attributes && (
                <Attributes
                  attributes={tokenMetadata.data.attributes}
                ></Attributes>
              )}
            </div>
            <div className={"mt-2"}>
              <h4>Traits</h4>
              {tokenMetadata.data?.traits && (
                <Attributes attributes={tokenMetadata.data.traits}></Attributes>
              )}
            </div>
          </RowThinContainer>
        </Container>
      </div>
    </>
  );
};

WorkTokenPage.getLayout = function getLayout(page: ReactElement) {
  // console.log("page token", page.props.slug);
  // const name = page.props.work.name;
  // const creator = page.props.work.creator;
  // const router = useRouter();
  // const { pid } = router.query;
  // console.log({ page });
  // page.props.tokenId;
  let img = "";
  if (page.props.token?.imageUrl) {
    img = normalizeIpfsUri(page.props.token.imageUrl);
  }
  let title = "";
  if (page.props.work?.name) {
    title = page.props.work.name;
  }
  if (page.props.tokenId) {
    title = `${title} #${page.props.tokenId}`;
  }
  const imgUrl = img
    ? `${
        process.env.NEXT_PUBLIC_HOST
      }/api/ogimage/work?img=${encodeURIComponent(img)}`
    : "";
  // console.log(
  //   "token",
  //   page.props.work?.slug,
  //   page.props.token?.token_id,
  //   "imgUrl",
  //   imgUrl
  // );
  return (
    <MainLayout metaTitle={title} image={imgUrl}>
      {page}
    </MainLayout>
  );
};
export const config = {
  staticPageGenerationTimeout: 120,
};

export default WorkTokenPage;
