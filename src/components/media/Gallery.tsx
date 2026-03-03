import { Col } from "react-bootstrap";
import { Token } from "./Token";
import styles from "../../../styles/Work.module.scss";

export const Gallery = ({
  workId,
  tokenIds,
  slug,
}: {
  slug: string;
  workId: number;
  tokenIds: string[];
}) => {
  return (
    <>
      {tokenIds.map((tokenId: string) => (
        <Col
          xs={12}
          md={6}
          lg={4}
          key={tokenId}
          className={styles.workGalleryItem}
        >
          <Token slug={slug} workId={workId} tokenId={tokenId} />
        </Col>
      ))}
    </>
    // <Container >
    //   {chunks.map((chunk, index) => (
    //     <Row  key={index}>
    //       {chunk.map((tokenId:string) => (
    //         <Col xs={12} md={6} lg={4} key={tokenId}>
    //           <Token tokenId={tokenId} />
    //         </Col>
    //       ))}
    //     </Row>
    //   ))}
    // </Container>
  );
};
