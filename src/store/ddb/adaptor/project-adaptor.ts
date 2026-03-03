import { Err, Ok, Result } from "../../../util/result";
import {
  CreateProjectRequest,
  FullEditProjectRequest,
} from "../../project.types";
import { ProjectRepositoryI } from "../../projectRepositoryI";
import { RepositoryDdb } from "../repository-ddb";
import {
  TokenEntity,
  WorkEntity,
  WorkUploadFile,
} from "../../../db-typeorm/model/work.entity";
import { UserEntity, WorkEntityDdb, WorkTokenEntityDdb } from "../../model";
import { TokenStatuses } from "../../types";
import chainInfo from "src/stargaze/chainInfo";
import { UserRepoDdb } from "../user-repo-ddb";
import { convertToSlug } from "../../../util/slug";

const mapToken = (token: WorkTokenEntityDdb): TokenEntity => {
  const out = new TokenEntity();
  out.id = token.workId.toString();
  out.token_id = token.tokenId.toString();
  out.hash = token.hash;
  out.status = parseInt(token.status.toString());
  out.imageUrl = token.imageUrl ?? null;
  out.metadataUri = token.metadataUrl ?? null;
  out.blockHeight = token.blockHeight;
  out.txHash = token.txHash;
  out.txMemo = token.txMemo ?? "";
  out.hashInput = token.hashInput;
  out.createdDate = token.created;
  out.updatedDate = token.updated;
  return out;
};
const mapWork = (work: WorkEntityDdb): WorkEntity => {
  const out = new WorkEntity();
  out.id = work.id;
  out.name = work.name;
  out.slug = work.slug;
  out.startDate = work.startDate;
  out.hidden = work.hidden === 1;
  out.owner = {
    id: work.ownerId,
    address: work.ownerAddress,
    name: "",
    ownedWorks: [],
    createdDate: new Date(0),
    updatedDate: new Date(0),
  };
  out.coverImageCid = work.coverImageCid ?? null;
  out.creator = work.creator;
  out.codeCid = work.codeCid ?? "";
  out.sg721 = work.sg721 ?? null;
  out.minter = work.minter ?? null;
  out.description = work.description;
  out.additionalDescription = work.descriptionAdditional ?? null;
  out.blurb = work.blurb;
  out.resolution = work.resolution ?? null;
  out.selector = work.selector ?? null;
  out.license = work.license ?? null;
  out.externalLink = work.externalLink ?? null;
  out.pixelRatio = work.pixelRatio;
  out.maxTokens = work.maxTokens;
  out.priceStars = work.priceStars;
  out.royaltyPercent = work.royaltyPercent;
  out.royaltyAddress = work.royaltyAddress ?? null;
  out.sg721CodeId = work.sg721CodeId ?? 0;
  out.minterCodeId = work.minterCodeId ?? 0;
  out.isDutchAuction = work.isDutchAuction;
  out.dutchAuctionEndDate = work.dutchAuctionEndDate ?? null;
  out.dutchAuctionEndPrice = work.dutchAuctionEndPrice ?? null;
  out.dutchAuctionDeclinePeriodSeconds =
    work.dutchAuctionDeclinePeriodSeconds ?? null;
  out.dutchAuctionDecayRate = work.dutchAuctionDecayRate ?? null;
  out.createdDate = work.created;
  out.updatedDate = work.updated;
  return out;
};

export class RepositoryDbbAdaptor implements ProjectRepositoryI {
  constructor(
    private repository: RepositoryDdb,
    private userRepo: UserRepoDdb
  ) {}

  async getAllTokensWithStatus(
    status: TokenStatuses,
    limit?: number
  ): Promise<TokenEntity[]> {
    const data = await this.repository.getAllTokensWithStatus(
      chainInfo().chainId,
      status,
      limit
    );
    return data.map(mapToken);
  }

  async getFinalizingTokens(): Promise<any> {
    const data = await this.repository.getFinalizingTokens(chainInfo().chainId);
    return data.map(mapToken);
  }

  async getLastSweptHeight() {
    const data = await this.repository.getLastSweptHeight(chainInfo().chainId);
    return {
      height: BigInt(data?.height ?? 0),
      updatedAt: data?.updated ?? new Date(0),
    };
  }

  async getProjectAndTokenById(
    projectId: string,
    tokenId: string
  ): Promise<{
    project: WorkEntity;
    token: TokenEntity;
  } | null> {
    const out = await this.repository.getProjectAndTokenById(
      chainInfo().chainId,
      parseInt(projectId),
      parseInt(tokenId)
    );
    if (!out) {
      return null;
    }
    return {
      project: mapWork(out.project),
      token: mapToken(out.token),
    };
  }

  async getProjectForId(id: string): Promise<WorkEntity | null> {
    const res = await this.repository.getProjectForId(
      chainInfo().chainId,
      parseInt(id)
    );
    if (!res) {
      return null;
    }
    return mapWork(res);
  }

  async getProjectForSg721(sg721: string): Promise<WorkEntity | null> {
    const res = await this.repository.getProjectForSg721(
      chainInfo().chainId,
      sg721
    );
    if (!res) {
      return null;
    }
    return mapWork(res);
  }

  async getProjectTokensWithStatus(
    projectId: string,
    status: TokenStatuses,
    limit?: number
  ): Promise<TokenEntity[]> {
    //query sg721
    const project = await this.repository.getProjectForId(
      chainInfo().chainId,
      parseInt(projectId)
    );
    //Chain:elgafar-1#sg721:stars1j4tajhls2fcc0k30gslgxn4q9395e49euwcc69z0g6kquas4gr9sh8a4zs
    if (!project?.sg721) {
      return [];
    }

    const out = await this.repository.getProjectTokens(
      chainInfo().chainId,
      project.sg721,
      {
        limit,
      }
    );
    return out.items.filter((x) => x.status == status.toString()).map(mapToken);
  }

  setCurrentPollHeightHeight(height: bigint): Promise<void> {
    return this.repository.setCurrentPollHeightHeight(
      chainInfo().chainId,
      Number(height)
    );
  }

  setLastSweptHeight(height: bigint): Promise<void> {
    return this.repository.setLastSweptHeight(
      chainInfo().chainId,
      Number(height)
    );
  }

  setTokenFinalMetadata(
    work: WorkEntity,
    token: TokenEntity,
    metadata_uri: string
  ): Promise<any> {
    return this.repository.setTokenFinalMetadata(
      {
        chainId: chainInfo().chainId,
        workId: work.id,
        tokenId: parseInt(token.token_id),
      },
      metadata_uri
    );
  }

  setTokenImage(
    work: WorkEntity,
    token: TokenEntity,
    image_url: string
  ): Promise<any> {
    return this.repository.setTokenImage(
      {
        chainId: chainInfo().chainId,
        workId: work.id,
        tokenId: parseInt(token.token_id),
      },
      image_url
    );
  }

  async setTokenStatus(
    work: WorkEntity,
    token: TokenEntity,
    status: TokenStatuses
  ): Promise<void> {
    await this.repository.setTokenStatus(
      {
        chainId: chainInfo().chainId,
        workId: work.id,
        tokenId: parseInt(token.token_id),
      },
      status
    );
  }

  //cal the new one???
  async updatePartial(
    work: Pick<WorkEntity, "id">,
    token: TokenEntity,
    updates: Partial<TokenEntity>
  ): Promise<void> {
    await this.repository.updatePartial(
      {
        chainId: chainInfo().chainId,
        workId: work.id,
        tokenId: parseInt(token.token_id),
      },
      {
        ...updates,
        status:
          typeof updates.status === "undefined"
            ? undefined
            : updates.status.toString(),
        imageUrl: updates.imageUrl ?? undefined,
      }
    );
  }

  async getAccountProjects({
    address,
    limit,
    offset,
    publishedState,
    direction,
  }: {
    address: string;
    limit: number;
    offset?: string | number | undefined;
    publishedState?: string | null;
    direction: "ASC" | "DESC";
  }): Promise<{ items: WorkEntity[]; nextOffset: string | undefined }> {
    if (typeof offset == "number") {
      throw new Error("offset should be a string for ddb");
    }
    const owner = await this.userRepo.getUser(chainInfo().chainId, address);
    if (!owner) {
      console.log("getAccountProjects no owner", address);
      return Promise.resolve({ items: [], nextOffset: undefined });
    }
    //todo this isn't returning anything
    const data = await this.repository.findProjectsForOwner(
      chainInfo().chainId,
      owner.id,
      {
        limit,
        next: offset,
        direction: direction.toLowerCase() === "desc" ? "desc" : "asc",
      }
    );
    return {
      items: data.items.map(mapWork),
      nextOffset: data.next,
    };
  }

  async getProjectPreviewImage(id: string): Promise<TokenEntity | null> {
    const work = await this.repository.getProjectForId(
      chainInfo().chainId,
      parseInt(id)
    );
    if (!work?.sg721) {
      return null;
    }
    const res = await this.repository.getProjectTokensWithImageUrl(
      chainInfo().chainId,
      work.sg721,
      {
        limit: 1,
      }
    );
    if (res.items.length == 0) {
      return null;
    }
    return mapToken(res.items[0]);
  }

  async getProjects({
    limit,
    offset,
    publishedState,
    includeHidden,
    order,
  }: {
    limit: number;
    offset?: string | number | undefined;
    publishedState?: string | null;
    includeHidden: boolean;
    order?: "desc" | "asc";
  }): Promise<{
    items: WorkEntity[];
    nextOffset: string | undefined;
  }> {
    const data = await this.repository.findPublishedWorks({
      chainId: chainInfo().chainId,
      limit,
      next: offset?.toString(),
      hidden: includeHidden,
      order,
    });
    return {
      items: data.data.map(mapWork),
      nextOffset: data.next,
    };
  }

  getToken({
    workId,
    tokenId,
  }: {
    workId: number;
    tokenId: string;
  }): Promise<TokenEntity | null> {
    return Promise.resolve(null);
  }

  async getTokenCount(slug: string): Promise<number> {
    const project = await this.repository.getProjectBySlug(
      chainInfo().chainId,
      slug
    );
    if (!project?.sg721) {
      return 0;
    }
    return this.repository.getProjectTokenCount(chainInfo().chainId, project.sg721);
  }

  async getProjectTokens2({
    workId,
    limit,
    offset,
    publishedState = "PUBLISHED",
  }: {
    workId: number;
    limit: number;
    offset?: string | number | undefined;
    // "PUBLISHED" | "UNPUBLISHED" | "ALL"
    publishedState: string | null;
  }): Promise<{
    items: TokenEntity[];
    nextOffset: string | number | undefined;
  }> {
    if (typeof offset === "number") {
      throw new Error("offset should be a string for ddb");
    }
    const offsetParsed =
      typeof offset === "string" ? parseInt(offset) : undefined;
    if (offsetParsed && isNaN(offsetParsed)) {
      throw new Error("offset should be a number or string for ddb");
    }
    const project = await this.repository.getProjectForId(
      chainInfo().chainId,
      workId
    );
    if (!project || !project.sg721) {
      return { items: [], nextOffset: undefined };
    }
    const data = await this.repository.getProjectTokens(
      chainInfo().chainId,
      project.sg721,
      {
        limit,
        next: offsetParsed,
      }
    );
    return {
      items: data.items.map(mapToken),
      nextOffset: data.next?.toString(),
    };
  }

  // async getTokens({
  //             limit,
  //             offset,
  //             publishedState,
  //             includeHidden,
  //           }: {
  //   limit: number;
  //   offset?: string|number | undefined;
  //   publishedState?: string | null;
  //   includeHidden: boolean
  // }): Promise<{ items: TokenEntity[]; nextOffset: string|number | undefined }> {
  //   if(typeof offset=='number'){
  //     throw new Error('offset should be a string for ddb')
  //   }
  //   const result=await this.repository.findPublishedWorks({chainId: chainInfo().chainId,
  //     limit, next:offset,
  //     hidden:includeHidden})
  //
  //   return {
  //     items: result.data.map(mapToken),
  //     nextOffset: result.next
  //   }
  // }

  async lastMintedToken(slug: string): Promise<TokenEntity | null> {
    const project = await this.repository.getProjectBySlug(
      chainInfo().chainId,
      slug
    );
    if (!project || !project.sg721) {
      return null;
    }
    const tokens = await this.repository.getProjectTokens(
      chainInfo().chainId,
      project.sg721,
      {
        limit: 1,
        direction: "desc",
      }
    );
    if (tokens.items.length == 0) {
      return null;
    }
    return mapToken(tokens.items[0]);
  }

  async createWorkToken(token: TokenEntity, sg721: string): Promise<boolean> {
    //create, return true if inserted
    const created = await this.repository.createWorkToken({
      ...token,
      sg721,
      chainId: chainInfo().chainId,
      workId: parseInt(token.work_id),
      tokenId: parseInt(token.token_id),
      imageUrl: token.imageUrl ?? undefined,
      metadataUrl: token.metadataUri ?? undefined,
      status: token.status.toString(),
    });
    return created.ok;
  }

  getProjectBySlug(slug: string): Promise<WorkEntity | null> {
    return this.repository
      .getProjectBySlug(chainInfo().chainId, slug)
      .then((x) => (x ? mapWork(x) : null));
  }

  async getFileUploadById(
    uploadId: string,
    work: WorkEntity
  ): Promise<WorkUploadFile | null> {
    const upload = await this.repository.getFileUploadById(uploadId);
    if (!upload) {
      return null;
    }
    if (upload.chainId !== chainInfo().chainId) {
      console.log(
        "mismatch upload.chainId",
        upload.chainId,
        "chainInfo().chainId",
        chainInfo().chainId
      );
      throw new Error("not found");
    }
    if (upload.workId !== work.id) {
      console.log("mismatch upload.workId", upload.workId, "work.id", work.id);
      throw new Error("not found");
    }

    return {
      ...upload,
      work,
      createdDate: upload.created,
      updatedDate: upload.updated,
    };
  }

  async updateProject(
    id: number,
    request: Partial<FullEditProjectRequest> &
      Pick<FullEditProjectRequest, "hidden" | "startDate">
  ): Promise<Result<WorkEntity>> {
    //
    const res = await this.repository.updateWorkPartial(
      { id: id, chainId: chainInfo().chainId },
      {
        ...request,
        sg721: request.sg721 ?? undefined,
        minter: request.minter ?? undefined,
        sg721CodeId: request.sg721CodeId ?? undefined,
        startDate: request.startDate ? new Date(request.startDate) : undefined,
        license: request.license ?? undefined,
        externalLink: request.externalLink ?? undefined,
        hidden:
          request.hidden === undefined ? undefined : request.hidden ? 1 : 0,
        dutchAuctionEndDate: request.dutchAuctionEndDate
          ? new Date(request.dutchAuctionEndDate)
          : undefined,
        coverImageCid: request.coverImageCid ?? undefined,
        descriptionAdditional:
          typeof request.additionalDescription === "undefined"
            ? undefined
            : (request.additionalDescription ?? undefined),
      }
    );
    return Ok(mapWork(res));
  }
  async deleteWork({ id }: { id: number }): Promise<boolean> {
    await this.repository.deleteWork(chainInfo().chainId, id);
    return true;
  }

  async saveUploadId(
    work: WorkEntity,
    filename: string
  ): Promise<WorkUploadFile> {
    const res = await this.repository.saveUploadId(
      chainInfo().chainId,
      work.id,
      filename
    );
    return {
      id: res.id,
      work,
      filename,
      createdDate: res.created,
      updatedDate: res.updated,
    };
  }
  getProject(idIn: string | number): Promise<WorkEntity | null> {
    const id = typeof idIn === "string" ? parseInt(idIn) : idIn;
    //todo join the owner user here?
    return this.repository
      .getProjectForId(chainInfo().chainId, id)
      .then((x) => (x ? mapWork(x) : null));
  }

  async createProject(
    owner: UserEntity,
    request: CreateProjectRequest
  ): Promise<Result<WorkEntity>> {
    const out = await this.repository.createWork({
      ...request,
      ownerId: owner.id,
      creator: owner.address,
      slug: convertToSlug(request.name),
      hidden: 0,
      isDutchAuction: false,
      chainId: chainInfo().chainId,
      description: request.description ?? "",
      blurb: request.blurb ?? "",
      maxTokens: request.maxTokens ?? 0,
      startDate: request.startDate ? new Date(request.startDate) : new Date(),
      ownerAddress: owner.address,
    });
    if (!out.ok) {
      return Err(new Error("createWork failed"));
    }
    return Ok(mapWork(out.value));
  }

  async deleteFileUploadEntry(uploadId: string) {
    await this.repository.deleteWorkUpload(uploadId);
    return;
  }
}
