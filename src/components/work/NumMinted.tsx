import styles from "../../../styles/Work.module.scss";
import { FC } from "react";
import * as React from "react";
import { Placeholder } from "react-bootstrap";
import { WorkSerializable } from "../../db-typeorm/serializable";
import { useNumMintedDb } from "../../hooks/useNumMintedDb";

interface NumMintedParams {
  slug: string;
  work: WorkSerializable;
}

export const NumMinted: FC<NumMintedParams> = (params: NumMintedParams) => {
  const {
    data: numMinted,
    error: numMintedError,
    isLoading: numMintedLoading,
  } = useNumMintedDb(params.slug);

  const collectionSize = params.work.maxTokens;

  const numMintedText =
    numMintedError || !Number.isFinite(numMinted) ? "-" : numMinted;
  const collectionSizeText = !Number.isFinite(collectionSize)
    ? "?"
    : collectionSize;

  return (
    <span className={styles.workAuthor}>
      <>
        {numMintedLoading ? (
          <Placeholder animation="glow">
            <Placeholder className={"d-inline-block Width-3"} />
          </Placeholder>
        ) : (
          numMintedText
        )}
        {" of "}
        {collectionSizeText}
        {" minted"}
      </>
    </span>
  );
};
