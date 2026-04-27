import styles from "../styles/About.module.scss";
import { ReactElement } from "react";
import MainLayout from "../src/layout/MainLayout";
import { Col, Container, Row } from "react-bootstrap";
import { RowThinContainer } from "../src/components/layout/RowThinContainer";
import Link from "next/link";

const Home = () => {
  return (
    <div>
      <Container className={styles.group2}>
        <RowThinContainer>
          <div style={{}}>
            <h1>Roadmap</h1>
            <p className={`${styles.subtitle}`}>
              The team behind public works is excited to build creator tools for
              generative art on Stargaze. We hope you can join us for this
              journey.
            </p>
            <ul>
              <li>
                <p className={`${styles.abouttext} `}>
                  September 16, 2022: Launch Imago, the minting platform that
                  powers PublicWorks.art.
                </p>
              </li>
              <li>
                <p className={`${styles.abouttext} `}>
                  September 16, 2022: Launch Work 1{" "}
                  <Link href={"/work/helio"}>
                    Helio
                  </Link>
                </p>
              </li>
              <li>
                <p className={`${styles.abouttext} `}>
                  September and beyond: Recruit generative artists and creators
                  to launch on PublicWorks.art
                </p>
              </li>
              <li>
                <p className={`${styles.abouttext} `}>
                  Late Q4 2022: Build Work creation tools for early adopter
                  artists.
                </p>
              </li>
              <li>
                <p className={`${styles.abouttext} `}>
                  Q1 2023: Create beta on platform mint capabilities. Open up
                  early access to Hyperion holders.
                </p>
              </li>
              <li>
                <p className={`${styles.abouttext} `}>
                  Q1-Q2 2023: Open platform to all artists. Release V2 of smart
                  contracts to facilitate on chain charitable giving.
                </p>
              </li>
            </ul>
          </div>
        </RowThinContainer>
      </Container>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout metaTitle={"Roadmap"}>{page}</MainLayout>;
};

export default Home;
