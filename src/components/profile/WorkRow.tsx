// @flow
import * as React from "react";
import { FC } from "react";
import { WorkSerializable } from "../../db-typeorm/serializable/works/workSerializable";
import Link from "next/link";
import { FlexBox } from "../layout/FlexBoxCenter";
import { PillSmall } from "../content/PillSmall";
import styles from "./UserProfile.module.scss";
import SpinnerLoading from "../loading/Loader";
import { ButtonGroup, Dropdown, Form } from "react-bootstrap";
import { useLastMintedToken } from "../../hooks/useLastMintedToken";
import { relativeTimeFromDates } from "../../util/date-fmt/format";
import { ButtonPWFRef } from "../button/Button";
import { trpcNextPW } from "../../server/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateWork } from "../../hooks/work/useInvalidateWork";
import useUserContext from "../../context/user/useUserContext";
import ModalStore from "../../modal/ModalStore";
import { useClientLoginMutation } from "src/hooks/useClientLoginMutation";
import { useNumMintedDb } from "../../hooks/useNumMintedDb";

interface Props {
  work: WorkSerializable;
  onChange: () => void;
}

function EditButtonDropdown({ work }: { work: WorkSerializable }) {
  return (
    <Dropdown as={ButtonGroup}>
      <Link href={`/create/${work.id}`} passHref={true} legacyBehavior>
        <ButtonPWFRef as="a" variant={"outline-secondary"}>
          Edit
        </ButtonPWFRef>
      </Link>
      <Dropdown.Toggle split variant="outline-secondary" />
      <Dropdown.Menu>
        <Dropdown.Item
          disabled={!!work.sg721}
          onClick={() => ModalStore.open("DeleteWorkModal", { work })}
        >
          <label>Delete</label>
        </Dropdown.Item>
        {/*<Dropdown.Item href="#/action-2">Another action</Dropdown.Item>*/}
        {/*<Dropdown.Item href="#/action-3">Something else</Dropdown.Item>*/}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export const WorkRow: FC<Props> = ({ work, onChange }: Props) => {
  const numMinted = useNumMintedDb(work.slug);
  const lastMintedToken = useLastMintedToken(work.slug);
  const { user } = useUserContext();
  const collectionSize = work.maxTokens;
  const published = !!work.sg721;
  const status = published ? "Published" : "Draft";
  const hidden = work.hidden ? "Hidden" : "visible";
  const { invalidateWork: invalidate } = useInvalidateWork();

  const utils = trpcNextPW.useContext();
  const login = useClientLoginMutation();

  const editWorkMutation = trpcNextPW.works.editWork.useMutation();
  const setHiddenMutation = useMutation({
    mutationFn: async ({ hidden }: { hidden: boolean }) => {
      await login.mutateAsync();
      console.log("setting hidden to", hidden);
      await editWorkMutation.mutateAsync({ id: work.id, hidden });
    },

    onSuccess: () => {
      try {
        console.log("invalidating work");
        onChange();
      } catch (e) {
        console.log("error invalidating", e);
      }
    },
  });

  const onHide = (hidden: boolean) => {
    setHiddenMutation.mutate({ hidden });
  };

  return (
    <div
      className={
        "d-flex flex-row flex-nowrap justify-content-between align-items-center"
      }
    >
      <div>
        <FlexBox>
          <Link
            className={styles.workTitleLink}
            href={`/work/${work.slug}`}
            passHref={true}
          >
            {work.name}
          </Link>

          <PillSmall
            className={"ms-2 text-muted"}
            color={published ? "green" : "yellow"}
          >
            {status}
          </PillSmall>
        </FlexBox>
        <div className={"mt-1"}>
          <FlexBox>
            <div className={"fs-7"}>
              <>
                {numMinted.isLoading ? <SpinnerLoading /> : numMinted.data} /{" "}
                {collectionSize} Minted
              </>
            </div>
            <div className={"fs-7 ms-2"}>
              Last Mint:{" "}
              {lastMintedToken?.data?.createdDate
                ? relativeTimeFromDates(
                    new Date(lastMintedToken?.data?.createdDate)
                  )
                : "NA"}
            </div>
          </FlexBox>
        </div>
        <>
          <div className={"d-flex align-items-center mt-2 gap-2"}>
            <Form.Check
              className={""}
              type="switch"
              id="custom-switch"
              label="Hidden"
              defaultChecked={!!work.hidden}
              disabled={!user.data || setHiddenMutation.isPending}
              onChange={(e) => {
                onHide(e.target.checked);
              }}
            />
            <div>
              <Link
                href={`/create/${work.id}/status`}
                passHref={true}
                legacyBehavior
                className={"text-decoration-none"}
              >
                Token Mint Status
              </Link>
            </div>
          </div>
        </>
      </div>

      <div>
        <EditButtonDropdown work={work} />
      </div>
    </div>
  );
};
