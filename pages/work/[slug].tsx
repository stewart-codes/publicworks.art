import { FieldControl } from "../../src/components/control/FieldControl";
import { RowSquareContainer } from "../../src/components/layout/RowSquareContainer";
import { RowThinContainer } from "../../src/components/layout/RowThinContainer";
import { RowWideContainer } from "../../src/components/layout/RowWideContainer";
import SpinnerLoading from "../../src/components/loading/Loader";
import { LiveMedia } from "../../src/components/media/LiveMedia";
import { PagedGallery } from "../../src/components/media/PagedGallery";
import { StarsAddressName } from "../../src/components/name/StarsAddressName";
import { NumMinted } from "../../src/components/work/NumMinted";
import { useNftMetadata } from "../../src/hooks/useNftMetadata";
import MainLayout from "../../src/layout/MainLayout";
import { normalizeIpfsUri } from "../../src/wasm/metadata";
import styles from "../../styles/Work.module.scss";
import {
  serializeWork,
  serializeWorkToken,
  WorkSerializable,
} from "../../src/db-typeorm/serializable";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { stores } from "src/store/stores";
import { useNumMintedDb } from "../../src/hooks/useNumMintedDb";

export async function getStaticPaths() {
  console.log("getStaticPaths, works");
  const { items: works } = await stores().project.getProjects({
    limit: 500,

    publishedState: "PUBLISHED",
    includeHidden: true,
  });
  // const static = [work];
  console.log("getStaticPaths, works, done");
  return {
    paths: works.map((s) => {
      return { params: { slug: s.slug } };
    }),
    fallback: "blocking",
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug;
  if (typeof slug !== "string") {
    return {
      notFound: true,
    };
  }
  const work = await stores().project.getProjectBySlug(slug);
  // if (slug !== "helio") {
  //   return {
  //     notFound: true,
  //   };
  // }
  if (!work) {
    return {
      notFound: true,
    };
  }
  const token = await stores().project.getToken({
    workId: work.id,
    tokenId: "1",
  });
  try {
    return {
      props: {
        work: serializeWork(work),
        token: token ? serializeWorkToken(token) : null,
      },
      revalidate: 10, // In seconds
      // fallback: "blocking",
    };
  } catch (e) {
    console.log("error", e);
    throw e;
  }
};
//InferGetStaticPropsType<typeof getStaticProps>
const WorkPage = ({ work }: { work: WorkSerializable }) => {
  const router = useRouter();
  // fetch num tokens
  const {
    data: numMinted,
    error: numMintedError,
    isLoading: numMintedLoading,
  } = useNumMintedDb(work?.slug, 2000);

  const [previewTokenId, setPreviewTokenId] = useState<string | null>(null);
  useEffect(() => {
    if (!numMinted || previewTokenId) {
      return;
    }
    setPreviewTokenId((Math.floor(Math.random() * numMinted) + 1).toString());
  }, [previewTokenId, numMinted]);

  const metadata = useNftMetadata({
    workId: work.id,
    tokenId: previewTokenId,
    refresh: false,
  });

  return (
    <>
      <div>
        <Container>
          <RowSquareContainer>
            <div
              className={`${styles.align_center} align-self-center`}
              style={{ minHeight: 500 }}
            >
              {metadata.isLoading ? (
                <SpinnerLoading />
              ) : metadata.isError ? (
                <img
                  style={{ maxWidth: 500 }}
                  src={normalizeIpfsUri("ipfs://" + work.coverImageCid)}
                />
              ) : metadata?.data?.animation_url ? (
                <LiveMedia
                  ipfsUrl={metadata?.data?.animation_url}
                  minHeight={500}
                />
              ) : (
                <img
                  style={{ maxWidth: 500 }}
                  src={normalizeIpfsUri("ipfs://" + work.coverImageCid)}
                />
              )}
            </div>
            <div className={" mt-2 text-end fw-light fst-italic"}>
              <Link
                href={
                  previewTokenId ? `/work/${work.slug}/${previewTokenId}` : "#"
                }
              >
                <span className={""}>
                  {metadata.data ? (
                    <>Showing #{previewTokenId}</>
                  ) : (
                    <>Showing cover image</>
                  )}
                </span>
              </Link>
            </div>
          </RowSquareContainer>
        </Container>
        <Container>
          <RowThinContainer className={`mt-1 ${styles.workHeader}`}>
            <div className={"mt-1"}>
              <div className={"d-flex flex-row justify-content-between"}>
                <h2 className={"fw-bold"}>{work.name + " "}</h2>
              </div>
              <div className={`mt-1`}>
                <div
                  className={
                    "d-flex flex-row align-items-baseline justify-content-between"
                  }
                >
                  <div className={"d-flex flex-row align-items-center"}>
                    <span>By </span>
                    <StarsAddressName
                      address={work.ownerAddress || work.creator}
                    />
                  </div>
                  {work.sg721 && work.minter ? (
                    <NumMinted
                      work={work}
                      slug={work.slug}
                    />
                  ) : (
                    <div>Deploy your work to view</div>
                  )}
                </div>
              </div>
              <div className={`mt-4 ${styles.displayLinebreak}`}>
                {work.description}
              </div>
              {work.additionalDescription && (
                <>
                  <div>
                    <h5 className={"mt-4"}>Additional Description</h5>
                    <p className={`${styles.displayLinebreak}`}>
                      {work.additionalDescription}
                    </p>
                  </div>
                </>
              )}
              <h5 className={"mt-4"}>Metadata</h5>
              <div className={`${styles.workAuthorLink}}`}>
                {work.externalLink && (
                  <>
                    <FieldControl name={"External Link"}>
                      {" "}
                      <a
                        href={work.externalLink}
                        rel="noreferrer"
                        target={"_blank"}
                      >
                        {work.externalLink}
                      </a>
                    </FieldControl>
                  </>
                )}
              </div>

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

              <div className={`${styles.sectionBreak}`}></div>
            </div>
          </RowThinContainer>
        </Container>

        <Container>
          <RowWideContainer className={`${styles.tokensGrid}`}>
            <h2 className={"Margin-T-4"}>Mints</h2>
            {process.env.NEXT_PUBLIC_TESTNET === "true" ? (
              <div className={"mt-2"}>** Showing Testnet Mints **</div>
            ) : (
              <></>
            )}

            {!!numMinted && !work.sg721 && (
              <div>
                <span>No NFTs minted</span>
              </div>
            )}

            {!!numMinted && !!work.sg721 && (
              <PagedGallery
                slug={work.slug}
                workId={work.id}
                totalNumTokens={numMinted}
              />
            )}
          </RowWideContainer>
        </Container>
      </div>
    </>
  );
};

WorkPage.getLayout = function getLayout(page: ReactElement) {
  // console.log("page work", page.props.slug);
  const name = page.props.work.name;
  const creator = page.props.work.creator;

  let img = "";
  if (page.props.token?.imageUrl) {
    img = normalizeIpfsUri(page.props.token.imageUrl);
  } else if (page.props.work?.imageUrl) {
    img = normalizeIpfsUri("ipfs://" + page.props.work.imageUrl);
  }

  const imgUrl = img
    ? `${process.env.NEXT_PUBLIC_HOST}/api/ogimage/work?img=${img}`
    : "";
  // console.log(
  //   "work",
  //   page.props.work?.slug,
  //   page.props.token?.token_id,
  //   "imgUrl",
  //   imgUrl
  // );
  return (
    <MainLayout metaTitle={`${name} by ${creator}`} image={imgUrl}>
      {page}
    </MainLayout>
  );
};

export default WorkPage;
