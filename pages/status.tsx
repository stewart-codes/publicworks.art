import styles from "../styles/About.module.scss";
import { ReactElement } from "react";
import MainLayout from "../src/layout/MainLayout";
import { Col, Container, Row } from "react-bootstrap";
import { RowThinContainer } from "../src/components/layout/RowThinContainer";
import Link from "next/link";
import { useIndexerStatus } from "../src/hooks/status/useIndexerStatus";
import SpinnerLoading from "../src/components/loading/Loader";
import { FieldControl } from "../src/components/control/FieldControl";

const Status = () => {
  const indexerStatus = useIndexerStatus();
  const latestBlockHeight = indexerStatus.data?.latestBlockHeight?.height || 0;
  const lastSweptBlock = indexerStatus.data?.lastSweptBlock?.height || 0;
  const diff = indexerStatus.data?.diff;
  const updatedAt = indexerStatus.data?.lastSweptBlock?.timestamp;
  const msDiff = Date.now() - (new Date(updatedAt || 0).getTime() || 0);
  const secondsDiff = Math.round(msDiff / 1000);
  const secondsLabel = `${secondsDiff} second${secondsDiff > 0 ? "s" : ""} ago`;
  return (
    <div>
      <Container className={styles.group2}>
        <RowThinContainer>
          <div>
            <h1>Indexer Status</h1>
            {indexerStatus.isLoading ? <SpinnerLoading /> : null}
            {indexerStatus.isError ? (
              <div>Error fetching indexer status</div>
            ) : null}
            {indexerStatus.isSuccess ? (
              <div>
                <div className={"mb-2"}>
                  <p>Public Works is {diff} blocks behind the blockchain.</p>
                  <p className={""}>
                    It is expected to be up to 1 minute behind the blockchain
                  </p>
                </div>
                <FieldControl name={"Stargaze's latest block:"}>
                  #{latestBlockHeight.toString()}
                </FieldControl>
                <FieldControl name={"Public works lasted indexed block:"}>
                  #{lastSweptBlock} {secondsLabel}
                </FieldControl>
                {/*<div>Stargaze's latest block is #{latestBlockHeight}</div>*/}
                {/*<div>*/}
                {/*  Public works indexed block #{lastSweptBlock} {secondsLabel}*/}
                {/*</div>*/}
              </div>
            ) : null}
          </div>
        </RowThinContainer>
      </Container>
    </div>
  );
};

Status.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout metaTitle={"Status"}>{page}</MainLayout>;
};

export default Status;
