import { WorkSerializable } from "../../db-typeorm/serializable";
import { trpcNextPW } from "src/server/utils/trpc";
import { Card, Container } from "react-bootstrap";
import styles from "../../../styles/Works.module.scss";
import stylesWork from "../../../styles/Work.module.scss";
import { useRouter } from "next/router";
import { isStarAddress, shortenAddress } from "../../wasm/address";
import { StarsAddressName } from "../name/StarsAddressName";
import React from "react";
import Link from "next/link";
import { cn } from "../../lib/css/cs";
import { useNumMintedDb } from "../../hooks/useNumMintedDb";

export const WorksGalleryComponent = ({
  work,
  className,
}: {
  work: WorkSerializable;
  className?: string;
}) => {
  const query = trpcNextPW.works.workPreviewImg.useQuery(
    {
      workId: work.id,
    },
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchOnReconnect: false,
    }
  );
  const w = work;
  const router = useRouter();
  const numMinted = useNumMintedDb(work.slug);

  let creatorName = w.creator;
  if (isStarAddress(creatorName)) {
    creatorName = shortenAddress(creatorName);
  }
  return (
    // <Col key={w.sg721} className={className}>
    <Card
      // style={{ width: "24rem" }}
      className={cn(styles.workCardContainer, className, "border-light")}
    >
      <Card.Img
        className={cn(
          styles.workCardImage,
          "rounded-1 rounded-top button tw-overflow-hidden"
        )}
        variant="top"
        src={query.isSuccess ? (query.data ?? undefined) : ""}
      />
      <Card.ImgOverlay className={`p-0 `}>
        <Link
          href={"/work/" + w.slug}
          className={cn("text-decoration-none", "tw-overflow-hidden")}
        >
          <Container
            className={
              "bg-gradient-transparent text-light rounded-top rounded-1 pt-3 pb-3 "
            }
          >
            <div
              className={`${stylesWork.workSmallTitle}  tw-font-title tw-tracking-wider ps-3 text-light`}
            >
              {w.name}
            </div>

            {/*<div className={"ps-3 text-decoration-none"}>{w.blurb}</div>*/}
          </Container>
        </Link>
      </Card.ImgOverlay>
      {/*<Card.Body>*/}
      {/*  /!*<Card.Title className={stylesWork.workSmallTitle}>{w.name}</Card.Title>*!/*/}
      {/*  /!*<Card.Text>{w.blurb}</Card.Text>*!/*/}
      {/*</Card.Body>*/}
      <Card.Footer className={"bg-white mb-1"}>
        <div className={"d-flex justify-content-between"}>
          <div className={"d-flex align-items-center"}>
            <span>By</span>
            <StarsAddressName address={work.ownerAddress || work.creator} />
          </div>
          <div className={"d-flex align-items-center"}>
            {numMinted.isLoading ? (
              "..."
            ) : (
              <>
                {numMinted.data} of {work.maxTokens}
              </>
            )}
          </div>
        </div>
      </Card.Footer>
    </Card>
    // </Col>
  );
};
