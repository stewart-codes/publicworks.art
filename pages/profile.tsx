import React, { FC, ReactElement, useCallback, useMemo, useState } from "react";
import { Container, Dropdown, Toast } from "react-bootstrap";
import MainLayout from "../src/layout/MainLayout";
import SpinnerLoading from "../src/components/loading/Loader";
import { trpcNextPW } from "../src/server/utils/trpc";
import { EditUserRequest } from "../src/store/user.types";
import { RowThinContainer } from "../src/components/layout/RowThinContainer";
import { EditProfile } from "../src/components/profile/EditProfile";
import { useToast } from "../src/hooks/useToast";
import { ButtonPW } from "../src/components/button/Button";
import { ToastContent } from "react-toastify/dist/types";
import { UserProfile } from "../src/components/profile/UserProfile";
import { FlexBox } from "../src/components/layout/FlexBoxCenter";
import { WorkSerializable } from "../src/db-typeorm/serializable/works/workSerializable";
import Link from "next/link";
import { useStargazeClient, useWallet } from "../@stargazezone/client";
import { UserSerializable } from "../src/db-typeorm/serializable/users/userSerializable";
import { shortenAddress } from "../src/wasm/address";
import { onMutateLogin } from "../src/trpc/onMutate";
import { useProfileInfo } from "../src/hooks/sg-names";
import { WorkRow } from "../src/components/profile/WorkRow";
import { Hr } from "../src/components/content/horizontalrule/HR";
import { useRouter } from "next/router";

interface Props {
  work: WorkSerializable;
}

interface UserWorksProps {
  user: UserSerializable;
}

export const UserWorks: FC<UserWorksProps> = (props: UserWorksProps) => {
  const router = useRouter();
  // const pageNumber = parseInt(router.query?.pageNumber?.toString() || "0") || 0;
  // const setPageNumber = useCallback(
  //   async (pageNumber: number) => {
  //     console.log("setPageNumber", pageNumber);
  //     await router.push(`/profile?pageNumber=${pageNumber}`);
  //   },
  //   [pageNumber]
  // );

  // const [pageNumber, setPageNumber] = useState(0);
  const utils = trpcNextPW.useContext();
  const [take, setTake] = useState(5);
  const limit = take;
  // const [page, setPage] = useState<WorkSerializable[]>([]);

  const queryInput = useMemo(
    () => ({
      publishedState: "ALL",
      limit,
      address: props.user.address,
      direction: "DESC",
      // cursor: pageNumber * limit,
    }),
    [props.user.address, limit]
  );
  const userWorksPage = trpcNextPW.works.listAddressWorks.useInfiniteQuery(
    queryInput,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      getPreviousPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined, // <-- optional you can pass an initialCursor
    }
  );

  const [page, setPage] = useState(0);

  const nextPage = useCallback(async () => {
    await userWorksPage.fetchNextPage();
    setPage((prev) => prev + 1);
  }, [userWorksPage.fetchNextPage]);
  const prevPage = useCallback(async () => {
    setPage((prev) => prev - 1);
  }, [userWorksPage.fetchPreviousPage]);
  const pageData = userWorksPage.data?.pages?.length
    ? userWorksPage.data?.pages[page]
    : undefined;

  const hasMore = !!pageData?.nextCursor;
  const hasPrevious = page > 0;

  const hasItems = !!pageData?.items.length;
  const pageItems = pageData?.items ?? [];

  // hasItems && page ? page : [];
  const onRowChanged = useCallback(() => {
    userWorksPage.refetch();
    utils.works.listAddressWorks.invalidate();
  }, [utils, userWorksPage, queryInput]);
  userWorksPage.data?.pageParams;
  console.log("userWorksPage", {
    userWorksPage,
    hasItems,
    datra: userWorksPage.data,
  });
  return (
    <div>
      <h2 className={"mt-2"}>Works</h2>
      {userWorksPage.isLoading && <SpinnerLoading />}
      {userWorksPage.isSuccess &&
        hasItems &&
        pageItems.map((w) => (
          <span key={w.id}>
            <Hr className={"text-muted"} />
            <WorkRow work={w} onChange={() => onRowChanged()}></WorkRow>
          </span>
        ))}
      {/*))}*/}
      {userWorksPage.isSuccess && hasItems && (
        <div>
          <div className={"mt-3"}>
            <div className={"tw-flex tw-flex-row tw-gap-1"}>
              <ButtonPW
                variant={"outline-secondary"}
                onClick={() => prevPage()}
                disabled={
                  !hasPrevious ||
                  userWorksPage.isLoading ||
                  userWorksPage.isFetchingNextPage ||
                  userWorksPage.isFetchingPreviousPage
                }
              >
                {"Previous"}
              </ButtonPW>
              <ButtonPW
                variant={"outline-secondary"}
                onClick={() => nextPage()}
                disabled={
                  !hasMore ||
                  userWorksPage.isLoading ||
                  userWorksPage.isFetchingNextPage ||
                  userWorksPage.isFetchingPreviousPage
                }
              >
                {"Next"}
              </ButtonPW>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-basic"
                >
                  {take}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item eventKey={"10"} onClick={() => setTake(5)}>
                    5
                  </Dropdown.Item>
                  <Dropdown.Item eventKey={"10"} onClick={() => setTake(10)}>
                    10
                  </Dropdown.Item>
                  <Dropdown.Item eventKey={"25"} onClick={() => setTake(25)}>
                    25
                  </Dropdown.Item>
                  <Dropdown.Item eventKey={"100"} onClick={() => setTake(100)}>
                    100
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          <div className={"mt-3"}></div>
        </div>
      )}
      {userWorksPage.isSuccess && !hasItems && (
        <div>
          <div>You haven't created any Works yet.</div>
          <div>
            <Link href={"/create"}>
              <ButtonPW variant={"secondary"}>Create Work</ButtonPW>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const utils = trpcNextPW.useContext();
  const [editMode, setEditMode] = useState(false);

  const sgwallet = useWallet();
  const sgclient = useStargazeClient();
  const useName = useProfileInfo({ address: sgwallet.wallet?.address });

  // const { user } = useUserContext();
  // const sgwallet = useWallet();
  // const address = sgwallet.wallet?.address;

  const userQuery = trpcNextPW.users.getUser.useQuery(
    {
      address: sgwallet.wallet?.address as string,
    },
    {
      enabled: !!sgwallet.wallet?.address,
    }
  );

  const address = sgwallet?.wallet?.address;
  const username = useName.walletName ? useName.walletName + ".stars" : address;

  // useUserRequired("/profile");
  // const login = useClientLoginMutation();
  const toast = useToast();
  const editUserMutation = trpcNextPW.users.editUser.useMutation({
    onMutate: onMutateLogin(sgclient.client, toast),
    onSuccess: () => {
      toast.success("Saved!");

      setEditMode(false);
      utils.users.getUser.invalidate();
    },
    onError: (e) => {
      setEditMode(false);
      toast.error(e.message);
    },
  });
  // const editUserLocalMutation = useMutation(async () => {
  //   await login.mutateAsync();
  //   await editUserMutation.mutateAsync();
  // });
  const onSubmitEdit = (req: Partial<EditUserRequest>) => {
    editUserMutation.mutate(req);
  };
  const displayUsername =
    username && username === address ? shortenAddress(address || "") : username;
  //EditProfile
  return (
    <>
      <div>
        <Container>
          <RowThinContainer>
            <FlexBox style={{ display: "inline", alignItems: "center" }}>
              <h1>
                Profile -{" "}
                {useName.isLoading ? (
                  <SpinnerLoading />
                ) : (
                  <span className={"text-reset"}>{displayUsername || ""}</span>
                )}
              </h1>
            </FlexBox>

            {/*<NeedToLoginButton url={"/profile"} />*/}

            {!editMode && userQuery.isSuccess && (
              <UserProfile user={userQuery.data} />
            )}
            {editMode && (
              <EditProfile
                defaultValues={userQuery.data}
                onSubmit={onSubmitEdit}
              />
            )}
            {editMode && editUserMutation.isPending && <SpinnerLoading />}
            {!editMode && !!userQuery.isSuccess && (
              <UserWorks user={userQuery.data} />
            )}
          </RowThinContainer>
        </Container>
      </div>
    </>
  );
};

const createWithMsg: ToastContent = ({ closeToast }) => {
  console.log("hi from the toast");
  return (
    <Toast onClose={closeToast}>
      <Toast.Header>
        <strong className="me-auto">Bootstrap</strong>
        <small>11 mins ago</small>
      </Toast.Header>
      <Toast.Body>hello</Toast.Body>
    </Toast>
  );
};

ProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout metaTitle={"Create"}>{page}</MainLayout>;
};

export default ProfilePage;
