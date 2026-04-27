import styles from "../styles/About.module.scss";
import { ReactElement } from "react";
import MainLayout from "../src/layout/MainLayout";
import { Col, Container, Nav, Row } from "react-bootstrap";
import {
  RowThinContainer,
  RowThinContainerFlex,
} from "../src/components/layout/RowThinContainer";
import Link from "next/link";

function GroupDividerBottom() {
  return (
    <div className={styles.groupDividerBottomOnly}>
      <span className={styles.align_center}>• • •</span>
    </div>
  );
}

const AboutPage = () => {
  // console.log("bkpoint", useBreakpoint());
  return (
    <Container>
      <RowThinContainer>
        <div>
          <h1>About Public Works</h1>
          <h3 className={`${styles.subtitle}`}>Mission</h3>

          <p className={`${styles.abouttext} `}>
            {
              "The goal of PublicWorks.art is to raise the profile of generative art in the world while also giving charitably. Starting with the Cosmos NFT space, we're building artist tools to support programmable artworks that create NFTs at mint time. No NFTs exist until a collector mints-- neither the artist nor collector know what will be generated until an NFT is minted. PublicWorks.art is one of only a few spaces that offers the opportunity to create and experience entirely unique, rare artwork from generative on-chain code."
            }
          </p>

          <p className={`${styles.abouttext} `}>
            We believe this co-creation of art is the most exciting form of
            generative art. And we&apos;re here for it.
          </p>

          <h3 className={`${styles.subtitle} `}>How we&apos;re doing it</h3>

          <p className={`${styles.abouttext} `}>
            Smart contracts enable programmable money. Public Works enables
            programmable art.
          </p>
          <p className={`${styles.abouttext} `}>
            PublicWorks.art is not a launchpad-- it is a platform supporting
            generative on-chain artworks. We work in tandem with the Stargaze
            launchpad. You can mint Works on Stargaze!
          </p>

          <p className={`${styles.abouttext} `}>
            The team behind PublicWorks.art is dedicated to building open NFT
            tools for generative collections. Soon, anyone can submit a
            generative collection. Think fxhash for the Cosmos.
          </p>

          <p className={`${styles.abouttext} `}>
            The future of generative art NFTs are interactive realtime
            multimedia powered by PublicWorks.art.
          </p>

          <h3 className={`${styles.subtitle} `}>The team</h3>

          <p className={`${styles.abouttext} `}>
            Skymagic is a professional engineer, artist, and generative art
            enthusiast making generative artworks for over a decade.
          </p>

          <h3 className={`${styles.subtitle} `}>Roadmap</h3>

          <p className={`${styles.abouttext} `}>
            <Link href={"/roadmap"}>Read the roadmap</Link>
          </p>
        </div>
      </RowThinContainer>
    </Container>
  );
};

AboutPage.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout metaTitle={"About"}>{page}</MainLayout>;
};

export default AboutPage;
