import { Button, ButtonGroup, Container, Nav, Navbar } from "react-bootstrap";
import styles from "../../styles/Home.module.scss";
import Link from "next/link";
import { ButtonPW } from "./button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWallet } from "@stargazezone/client";
import { FC } from "react";
import { useProfileInfo } from "../hooks/sg-names";

export const NavBar: FC = () => {
  const sgwallet = useWallet();
  const address = sgwallet?.wallet?.address;
  const nameInfo = useProfileInfo({ address });
  const username = nameInfo.walletName
    ? nameInfo.walletName + ".stars"
    : undefined;

  return (
    <Navbar bg="white" variant="light" expand="sm">
      <Container fluid>
        <Link href={"/"}>
          <Navbar.Brand className={styles.navTitle}>
            PublicWorks.Art
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="me-auto">
            <Nav.Link href="/works">Works</Nav.Link>
            <Nav.Link href="/test">Test</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/docs">Docs</Nav.Link>
            <Nav.Link href="/blog">Blog</Nav.Link>
            {/* <Nav.Link href="/status">Status</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>

        <Navbar.Collapse className="justify-content-end">
          {sgwallet.wallet && (
            <Navbar.Text>
              <Link href={"/create"}>
                <Button style={{ marginRight: "1rem" }} variant="primary">
                  Create
                </Button>
              </Link>
            </Navbar.Text>
          )}

          {sgwallet.wallet && (
            <Navbar.Text>
              <span>
                <span>
                  <ButtonGroup aria-label="Basic example">
                    <Link href={"/profile"}>
                      {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */}
                      <Button variant="secondary">
                        {username ? username : undefined}
                        {!username &&
                          address &&
                          `${address.slice(0, 9)}...${address.slice(-5)}`}
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        sgwallet.logout();
                      }}
                    >
                      <Nav.Link>
                        <FontAwesomeIcon
                          icon={"arrow-right-from-bracket"}
                          width={18}
                        />
                      </Nav.Link>
                    </Button>
                  </ButtonGroup>
                </span>
              </span>
            </Navbar.Text>
          )}
          {!sgwallet.wallet && (
            <Navbar.Text>
              <span>
                <Nav.Link
                  onClick={async () => {
                    sgwallet.login();
                  }}
                >
                  <ButtonPW>Sign In</ButtonPW>
                </Nav.Link>
              </span>
            </Navbar.Text>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
