import Link from "next/link";
import { Card } from "react-bootstrap";
import styles from "../../../styles/Works.module.scss";
import { useNftMetadata } from "../../hooks/useNftMetadata";

export const Token = ({
  tokenId,
  workId,
  slug,
}: {
  workId: number;
  tokenId: string;
  slug: string;
}) => {
  const metadata = useNftMetadata({ tokenId, workId });

  const imageUrl = metadata?.data?.image
    ? metadata?.data?.image + "_medium"
    : "/img/rendering-in-progress.png";
  return (
    <Card className={styles.workCardContainer}>
      <Link href={`/work/${slug}/${tokenId}`}>
        {metadata.isLoading ? (
          <Card.Img variant="top" src={""} />
        ) : (
          <Card.Img variant="top" src={imageUrl} />
        )}
      </Link>
      <Card.Body>
        <Card.Title>#{tokenId}</Card.Title>
        <Card.Text>
          <Link
            href={`/work/${slug}/${encodeURIComponent(tokenId)}`}
            as={`/work/${slug}/${encodeURIComponent(tokenId)}`}
            className={"Token-link"}
          >
            Details
          </Link>{" "}
          |{" "}
          <a
            href={metadata?.data?.image}
            className={"Token-link"}
            download={"true"}
          >
            Image
          </a>{" "}
          |{" "}
          <a
            href={metadata?.data?.animation_url}
            target={"_blank"}
            className={"Token-link"}
            rel="noreferrer"
          >
            Live
          </a>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};
