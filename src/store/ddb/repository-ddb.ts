import { Err, Ok, Result } from "../../util/result";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BlockheightEntityDdb,
  UserEntityDdb,
  WorkEntityDdb,
  WorkTokenEntityDdb,
  WorkUploadFileEntityDdb,
} from "../model/ddb";
import { TokenStatuses } from "../types";
import { createId } from "../uuid";
import { DddTable, isConditionFailedError } from "./ddb-schema";

export enum EntityDdbError {
  NotFound,
  AlreadyExists,
  Unknown,
}

export class RepositoryDdb extends DddTable {
  constructor(name: string, client: DynamoDBClient) {
    super(client, name);
  }

  createTable() {
    // this will default to pay per request billing
    return this.table.createTable({});
  }

  async createWork(
    work: Omit<
      WorkEntityDdb,
      | "id"
      | "created"
      | "updated"
      | "resolution"
      | "selector"
      | "pixelRatio"
      | "priceStars"
      | "royaltyPercent"
      | "startDate"
    > & {
      startDate?: Date;
      resolution?: string;
      selector?: string;
      pixelRatio?: number;
      priceStars?: number;
      royaltyPercent?: number;
    }
  ): Promise<Result<WorkEntityDdb, EntityDdbError>> {
    const Work = this.models.Work;
    try {
      //increment the id using atomic counter
      try {
        //create it if it doesn't exist
        await this.models.IdCounter.create({ chainId: work.chainId, count: 0 });
      } catch (e) {
        //ignore
      }
      const counter = await this.models.IdCounter.update(
        { chainId: work.chainId },
        {
          add: {
            count: 1,
          },
          return: "UPDATED_NEW",
        }
      );
      if (!counter.count) {
        throw new Error("counter.count is undefined");
      }
      const id = counter.count;
      const out = await Work.create({
        ...work,
        id: id,
        startDate: work.startDate ?? new Date(0),
        publishStatus: work.sg721 ? 1 : 0,
      });

      return Ok(out);
    } catch (e) {
      console.log("error creating work", e);
      if (isConditionFailedError(e)) {
        return Err(EntityDdbError.AlreadyExists);
      }
      throw e;
    }
  }

  async createWorkToken(
    workToken: Omit<WorkTokenEntityDdb, "created" | "updated">
  ): Promise<Result<WorkTokenEntityDdb, EntityDdbError>> {
    try {
      const out = await this.models.WorkToken.create(workToken, {
        consistent: true,
      });
      return Ok<WorkTokenEntityDdb, EntityDdbError>(out);
    } catch (e) {
      if (isConditionFailedError(e)) {
        return Err(EntityDdbError.AlreadyExists);
      }
      throw e;
    }
  }

  async createWorkTokenMigration(
    workToken: WorkTokenEntityDdb
  ): Promise<WorkTokenEntityDdb> {
    return this.models.WorkToken.create(workToken, { timestamps: false });
  }

  getAllTokensWithStatus(
    chainId: string,
    status: TokenStatuses,
    limit?: number
  ): Promise<WorkTokenEntityDdb[]> {
    return this.models.WorkToken.find(
      {
        chainId,
        status: status.toString(),
      },
      { limit, index: "gsi1" }
    );
  }

  getFinalizingTokens(chainId: string): Promise<WorkTokenEntityDdb[]> {
    return this.getAllTokensWithStatus(chainId, TokenStatuses.FINALIZING);
  }

  async getLastSweptHeight(
    chainId: string
  ): Promise<BlockheightEntityDdb | undefined> {
    const height = await this.models.BlockHeight.get({
      chainId: chainId,
      id: "last_swept_height",
    });
    return height;
  }

  async setLastSweptHeight(chainId: string, height: number): Promise<void> {
    // await this.models.BlockHeight.upsert({});
    await this.models.BlockHeight.upsert({
      chainId: chainId,
      id: "last_swept_height",
      height: height,
    });
    return;
  }

  async setCurrentPollHeightHeight(
    chainId: string,
    height: number
  ): Promise<void> {
    // await this.models.BlockHeight.upsert({});
    await this.models.BlockHeight.upsert({
      chainId: chainId,
      id: "poll_height",
      height: height,
    });
    return;
  }

  async getToken(
    chainId: string,
    workId: number,
    tokenId: number
  ): Promise<WorkTokenEntityDdb | undefined> {
    const work = await this.getProjectForId(chainId, workId);
    if (!work || !work.sg721) {
      return undefined;
    }
    return this.getTokenById({ chainId, sg721: work.sg721, tokenId });
  }

  async getTokenById({
    chainId,
    sg721,
    tokenId,
  }: {
    chainId: string;
    sg721: string;
    tokenId: number;
  }): Promise<WorkTokenEntityDdb | undefined> {
    return this.models.WorkToken.get({ chainId, sg721: sg721, tokenId });
  }

  async getProjectAndTokenById(
    chainId: string,
    projectId: number,
    tokenId: number
  ): Promise<{
    project: WorkEntityDdb;
    token: WorkTokenEntityDdb;
  } | null> {
    const project = await this.getProjectForId(chainId, projectId);
    if (!project?.sg721) {
      return null;
    }
    const token = await this.getTokenById({
      chainId,
      sg721: project.sg721,
      tokenId,
    });
    if (!project || !token) {
      return null;
    }
    return { project, token };
  }

  getProjectForId(
    chainId: string,
    id: number
  ): Promise<WorkEntityDdb | undefined> {
    return this.models.Work.get({
      pk: `Chain:${chainId}#Work:${id}`,
      sk: `Work:`,
    });
  }

  getProjectBySlug(
    chainId: string,
    slug: string
  ): Promise<WorkEntityDdb | undefined> {
    return this.models.Work.get({ chainId, slug }, { index: "gsi3" });
  }

  getProjectForSg721(
    chainId: string,
    sg721: string
  ): Promise<WorkEntityDdb | undefined> {
    return this.models.Work.get({ chainId, sg721 }, { index: "gsi4" });
  }

  async findProjectsForOwner(
    chainId: string,
    ownerId: string,
    {
      limit,
      next,
      direction,
    }: { limit?: number; next?: string; direction?: Direction }
  ): Promise<{ items: WorkEntityDdb[]; next: string | undefined }> {
    const nextObj = this.deserializeNext(next);
    const items = await this.models.Work.find(
      {
        gsi1_pk: `User:${ownerId}`,
        gsi1_sk: { begins_with: `Chain:${chainId}` },
      },
      { index: "gsi1", limit, next: nextObj, reverse: direction === "desc" }
    );

    return {
      items,
      next: this.serializeNext(items.next),
      // prev: this.serializeNext(items.prev),
    };
  }

  private deserializeNext(next: string | undefined): object | undefined {
    let nextObj: object | undefined;
    if (next) {
      try {
        nextObj = JSON.parse(Buffer.from(next, "base64").toString("utf-8"));
      } catch (e) {
        console.log("error parsing next", e);
        throw new Error("error parsing next");
      }
    }
    return nextObj;
  }
  private serializeNext(nextObj: object | undefined): string | undefined {
    let nextStr: string | undefined;
    if (nextObj) {
      nextStr = Buffer.from(JSON.stringify(nextObj)).toString("base64");
    }
    return nextStr;
  }
  async findPublishedWorks({
    chainId,
    hidden,
    limit,
    next,
    order,
  }: {
    chainId: string;
    hidden?: boolean;
    limit?: number;
    next?: string;
    order?: "asc" | "desc";
  }): Promise<{ data: WorkEntityDdb[]; next: string | undefined }> {
    //todo check out the gsi2_pk value see why > is not working

    //this index might not work, because hidden == 1 which is greater than hidden == 0
    // so it will include hidden works
    const globalPublished = await this.models.Work.find(
      {
        //issue here is that published really means sg721 is set, so i need that in the pk
        gsi2_pk: `Chain:${chainId}#hidden:${hidden ? 1 : 0}#publishStatus:1`,
        // multiple key conditions for sk not supported by ddb :)
        gsi2_sk: {
          ">": `startDate:${new Date(60).toISOString()}`,
        },
      },
      {
        reverse: order === "desc",
        index: "gsi2",
        next: this.deserializeNext(next),
        limit: limit ?? 10,
        log: true,
        // execute: false,
      }
    );
    // this.table.queryItems();

    return {
      data: globalPublished,
      next: this.serializeNext(globalPublished.next),
    };
  }

  async getProjectTokenCount(chainId: string, sg721: string): Promise<number> {
    const result = await this.models.WorkToken.find(
      { pk: `Chain:${chainId}#sg721:${sg721}` },
      { count: true }
    );
    return (result as any).count ?? 0;
  }

  async getProjectTokens(
    chainId: string,
    sg721: string,
    {
      limit,
      direction = "asc",
      next, //next should be a token id to start with for this query
    }: { limit?: number; direction?: Direction; next?: number } = {}
  ): Promise<{ items: WorkTokenEntityDdb[]; next: number | undefined }> {
    limit = (limit ?? 10) + 1;
    const hasNext = next !== undefined;
    const out = await this.models.WorkToken.find(
      {
        pk: `Chain:${chainId}#sg721:${sg721}`,
        sk: hasNext
          ? { ">=": `WorkToken:${next.toString().padStart(18, "0")}` }
          : undefined,
      },
      {
        log: false,
        limit,
        reverse: direction === "desc" /*, next: this.deserializeNext(next) */,
      }
    );
    const nextToken =
      out.length > limit - 1 ? out[limit - 1].tokenId : undefined;
    return {
      items: out.slice(0, limit - 1),
      next: nextToken,
    };
  }

  async getProjectTokensWithImageUrl(
    chainId: string,
    sg721: string,
    {
      limit,
      direction = "asc",
      next,
    }: { limit?: number; direction?: Direction; next?: string } = {}
  ): Promise<{ items: WorkTokenEntityDdb[]; next: string | undefined }> {
    const out = await this.models.WorkToken.find(
      {
        chainId,
        sg721,
      },
      {
        limit,
        reverse: direction === "desc",
        next: this.deserializeNext(next),
        where: `attribute_exists(imageUrl)`,
      }
    );
    return {
      items: out,
      next: this.serializeNext(out.next),
    };
  }

  //todo
  // getProjectTokensWithStatus(
  //   chainId: string,
  //   projectId: number,
  //   status: TokenStatuses,
  //   limit?: number,
  // ): Promise<WorkTokenEntityDdb[]> {
  //   return this.models.WorkToken.find(
  //     { chainId, workId: projectId, status: status.toString() },
  //     { index: 'gsi1', limit },
  //   );
  // }

  setTokenFinalMetadata(
    token: Pick<WorkTokenEntityDdb, "chainId" | "workId" | "tokenId">,
    metadata_uri: string
  ): Promise<any> {
    return this.updatePartial(token, { metadataUrl: metadata_uri });
  }

  setTokenImage(
    token: Pick<WorkTokenEntityDdb, "chainId" | "workId" | "tokenId">,
    image_url: string
  ): Promise<WorkTokenEntityDdb> {
    return this.updatePartial(token, { imageUrl: image_url });
  }

  setTokenStatus(
    token: Pick<WorkTokenEntityDdb, "chainId" | "workId" | "tokenId">,
    status: TokenStatuses
  ): Promise<WorkTokenEntityDdb> {
    return this.updatePartial(token, { status: status.toString() });
  }

  async updateWorkPartial(
    work: Pick<WorkEntityDdb, "chainId" | "id">,
    updates: Partial<
      Omit<
        WorkEntityDdb,
        | "chainId"
        | "id"
        | "created"
        | "updated"
        | "slug"
        | "ownerId"
        | "publishStatus"
      >
    >
  ): Promise<WorkEntityDdb> {
    const props = {
      chainId: work.chainId,
      id: work.id,
      ...updates,
      publishStatus: typeof updates.sg721 === "string" ? 1 : undefined,
    };
    return this.models.Work.update(props, {
      partial: true,
    });
  }
  updatePartial(
    token: Pick<WorkTokenEntityDdb, "chainId" | "workId" | "tokenId">,
    updates: Partial<
      Omit<
        WorkTokenEntityDdb,
        "workId" | "tokenId" | "chainId" | "updated" | "created"
      >
    >
  ): Promise<WorkTokenEntityDdb> {
    return this.models.WorkToken.update(
      {
        chainId: token.chainId,
        tokenId: token.tokenId,
        workId: token.workId,
        ...updates,
      },
      {
        partial: true,
      }
    );
  }

  // async createUser(user: Omit<UserEntityDdb, "created" | "updated">) {
  //   return this.models.User.create(user);
  // }

  // async createUserWithId(user: UserEntityDdb) {
  //   return this.models.User.create(user, { timestamps: false });
  // }

  // setIdCounter(chainId: string, maxId: number) {
  //   return this.models.IdCounter.upsert({ chainId, count: maxId });
  // }

  async createWorkUploadFileMigration(
    workUpload: WorkUploadFileEntityDdb
  ): Promise<WorkUploadFileEntityDdb> {
    return this.models.WorkUploadFile.create(workUpload, { timestamps: false });
  }

  async getFileUploadById(
    uploadId: string
  ): Promise<WorkUploadFileEntityDdb | undefined> {
    return this.models.WorkUploadFile.get({ id: uploadId });
  }

  async deleteWork(chainId: string, id: number): Promise<void> {
    await this.models.Work.remove({ chainId, id });
  }

  saveUploadId(
    chainId: string,
    workId: number,
    filename: string
  ): Promise<WorkUploadFileEntityDdb> {
    const id = createId();
    return this.models.WorkUploadFile.create({ chainId, id, filename, workId });
  }

  async deleteWorkUpload(uploadId: string): Promise<void> {
    await this.models.WorkUploadFile.remove({
      id: uploadId,
    });
    return;
  }
}

export type Direction = "asc" | "desc";

export type WorkEntityDdbCreate = Omit<
  WorkEntityDdb,
  "startDate" | "resolution" | "selector"
>;

const readonlyError =
  "publicworks.art is now readonly. Thank you for your support!";
export class RepositoryDdbReadonly extends RepositoryDdb {
  constructor(name: string, client: DynamoDBClient) {
    super(name, client);
  }

  //override all of the write methods to throw an error
  override createWork(
    work: WorkEntityDdb
  ): Promise<Result<WorkEntityDdb, EntityDdbError>> {
    throw new Error(readonlyError);
  }
  override createWorkToken(
    workToken: WorkTokenEntityDdb
  ): Promise<Result<WorkTokenEntityDdb, EntityDdbError>> {
    throw new Error(readonlyError);
  }

  override saveUploadId(
    chainId: string,
    workId: number,
    filename: string
  ): Promise<WorkUploadFileEntityDdb> {
    throw new Error(readonlyError);
  }
  override deleteWork(chainId: string, id: number): Promise<void> {
    throw new Error(readonlyError);
  }
  override deleteWorkUpload(uploadId: string): Promise<void> {
    throw new Error(readonlyError);
  }
  override updateWorkPartial(
    work: WorkEntityDdb,
    updates: Partial<WorkEntityDdb>
  ): Promise<WorkEntityDdb> {
    throw new Error(readonlyError);
  }
  override createWorkUploadFileMigration(
    workUpload: WorkUploadFileEntityDdb
  ): Promise<WorkUploadFileEntityDdb> {
    throw new Error(readonlyError);
  }
  override updatePartial(
    token: WorkTokenEntityDdb,
    updates: Partial<WorkTokenEntityDdb>
  ): Promise<WorkTokenEntityDdb> {
    throw new Error(readonlyError);
  }
  override setTokenFinalMetadata(
    token: WorkTokenEntityDdb,
    metadata_uri: string
  ): Promise<WorkTokenEntityDdb> {
    throw new Error(readonlyError);
  }
  override setTokenImage(
    token: WorkTokenEntityDdb,
    image_url: string
  ): Promise<WorkTokenEntityDdb> {
    throw new Error(readonlyError);
  }
  override setTokenStatus(
    token: WorkTokenEntityDdb,
    status: TokenStatuses
  ): Promise<WorkTokenEntityDdb> {
    throw new Error(readonlyError);
  }
  override setLastSweptHeight(chainId: string, height: number): Promise<void> {
    throw new Error(readonlyError);
  }
  override setCurrentPollHeightHeight(
    chainId: string,
    height: number
  ): Promise<void> {
    throw new Error(readonlyError);
  }
  override createWorkTokenMigration(
    workToken: WorkTokenEntityDdb
  ): Promise<WorkTokenEntityDdb> {
    throw new Error(readonlyError);
  }
}
