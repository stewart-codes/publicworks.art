import { Dispatch, ReactNode, useCallback, useEffect, useState } from "react";
import { WalletInfo } from "../../core/wallet/types";
import useStargazeClient from "../client/useStargazeClient";
import WalletContext from "./WalletContext";
import { useToast } from "src/hooks/useToast";
import { deleteToken, getToken } from "../../../../src/util/auth-token";
import { getAccountFromToken } from "../../../../src/auth/jwt";

function NoKeplrModal({
  noKeplr,
  setNoKeplr,
}: {
  noKeplr: boolean;
  setNoKeplr: Dispatch<boolean>;
}) {
  const toast = useToast();
  console.log("rendering no keplr");
  useEffect(() => {
    return () => {
      if (noKeplr) toast.error("Keplr not installed");
    };
  }, [noKeplr]);

  return <></>;
  // if (isMobile) {
  //   return (
  //     <Modal
  //       style={{ backgroundColor: "transparent !important" }}
  //       show={noKeplr}
  //       onHide={() => setNoKeplr(true)}
  //     >
  //       <Modal.Dialog>
  //         <Modal.Header closeButton>
  //           <Modal.Title>No wallet</Modal.Title>
  //         </Modal.Header>
  //         <Modal.Body>
  //           <p>Download Keplr Mobile. https://www.keplr.app/</p>
  //         </Modal.Body>
  //       </Modal.Dialog>
  //     </Modal>
  //   );
  // }
  // return (
  //   <Modal
  //     style={{ backgroundColor: "transparent !important" }}
  //     show={noKeplr}
  //     onHide={() => setNoKeplr(true)}
  //   >
  //     <Modal.Dialog>
  //       <Modal.Header closeButton>
  //         <Modal.Title>No wallet</Modal.Title>
  //       </Modal.Header>
  //       <Modal.Body>
  //         <p>Download Keplr Mobile. https://www.keplr.app/</p>
  //       </Modal.Body>
  //     </Modal.Dialog>
  //   </Modal>
  // );
}

function clearLocalStorage() {
  localStorage.removeItem("address");
  localStorage.removeItem("walletName");
  deleteToken();
}

function checkLocalStorage() {
  const address = localStorage.getItem("address");
  const name = localStorage.getItem("walletName");

  if (address) {
    return {
      address,
      name,
    };
  }
}

function setLocalStorage({
  address,
  name,
}: {
  address: string;
  name?: string;
}) {
  localStorage.setItem("address", address);
  localStorage.setItem("walletName", name ?? "My Wallet");
}

export default function WalletProvider({ children }: { children: ReactNode }) {
  const { client, connectSigning } = useStargazeClient();
  const [wallet, setWallet] = useState<WalletInfo>();
  const [noKeplr, setNoKeplr] = useState(false);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const logout = useCallback(async () => {
    clearLocalStorage();
    setWallet(undefined);
    await client?.disconnectSigning();
  }, [client]);

  function updateWallet({ address, name, balance }: WalletInfo) {
    const account = getAccountFromToken();
    if (account && account !== address) {
      deleteToken();
    }
    setLocalStorage({
      address: address,
      name: name,
    });
    setWallet({ address, name, balance });
  }

  const login = useCallback(async (): Promise<WalletInfo | null> => {
    if (!client) {
      return null;
    }

    await client.connect();

    // true = Refetch latest wallet from Keplr
    await client.wallet.getWallet(true);

    const w = client?.wallet;

    if (!w?.wallet) {
      setNoKeplr(true);
      return null;
    }

    updateWallet(w.wallet);
    connectSigning();

    return w.wallet;
  }, [client, connectSigning]);

  const loginIfLocalData = useCallback(() => {
    const localData = checkLocalStorage();
    console.log("loginIfLocalData", localData);
    if (localData) {
      login();
    }
  }, [login]);

  // Initial load / or Keplr Wallet Changed
  useEffect(() => {
    window.addEventListener("keplr_keystorechange", () => {
      loginIfLocalData();
    });
    setLoading(false);
  }, [login, loginIfLocalData]);

  async function refreshBalance() {
    const newBalance = await client?.wallet?.getBalance();

    if (client?.wallet?.wallet) {
      setWallet({
        ...client.wallet.wallet,
        balance: newBalance,
      });
    }
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        refreshBalance,
        login,
        logout,
        loading,
      }}
    >
      {children}
      {noKeplr && <NoKeplrModal noKeplr={noKeplr} setNoKeplr={setNoKeplr} />}
    </WalletContext.Provider>
  );
}
