import { TokenEntity, UserEntity, WorkEntity, WorkUploadFile } from "./model";
import { CreateProjectRequest, FullEditProjectRequest } from "./project.types";
import { ProjectRepositoryI } from "./projectRepositoryI";
import { TokenStatuses } from "./types";
import { Result } from "src/util/result";

export const readonlyError =
  "publicworks.art is now readonly. Thank you for your support!";

export class ReadonlyProjectRepository implements ProjectRepositoryI {
  constructor(
    private readonly wrapped: ProjectRepositoryI,
    private readonly message: string = readonlyError
  ) {}

  private throwReadonly(): never {
    throw new Error(this.message);
  }

  getLastSweptHeight(): Promise<{ height: bigint; updatedAt: Date }> {
    return this.wrapped.getLastSweptHeight();
  }

  setLastSweptHeight(height: bigint): Promise<void> {
    return this.throwReadonly();
  }

  setCurrentPollHeightHeight(height: bigint): Promise<void> {
    return this.throwReadonly();
  }

  deleteFileUploadEntry(uploadId: string): Promise<void> {
    return this.throwReadonly();
  }

  getAllTokensWithStatus(
    status: TokenStatuses,
    limit?: number
  ): Promise<TokenEntity[]> {
    return this.wrapped.getAllTokensWithStatus(status, limit);
  }

  getProjectTokensWithStatus(
    projectId: string,
    status: TokenStatuses,
    limit?: number
  ): Promise<TokenEntity[]> {
    return this.wrapped.getProjectTokensWithStatus(projectId, status, limit);
  }

  getProjectForSg721(sg721: string): Promise<WorkEntity | null> {
    return this.wrapped.getProjectForSg721(sg721);
  }

  getProjectForId(id: string): Promise<WorkEntity | null> {
    return this.wrapped.getProjectForId(id);
  }

  getProject(id: string | number): Promise<WorkEntity | null> {
    return this.wrapped.getProject(id);
  }

  getProjectAndTokenById(
    projectId: string,
    tokenId: string
  ): Promise<{ project: WorkEntity; token: TokenEntity } | null> {
    return this.wrapped.getProjectAndTokenById(projectId, tokenId);
  }

  setTokenStatus(
    work: Pick<WorkEntity, "id">,
    token: TokenEntity,
    status: TokenStatuses
  ): Promise<void> {
    return this.throwReadonly();
  }

  updatePartial(
    work: Pick<WorkEntity, "id">,
    token: TokenEntity,
    updates: Partial<TokenEntity>
  ): Promise<void> {
    return this.throwReadonly();
  }

  setTokenImage(
    work: Pick<WorkEntity, "id">,
    token: TokenEntity,
    image_url: string
  ): Promise<any> {
    return this.throwReadonly();
  }

  setTokenFinalMetadata(
    work: Pick<WorkEntity, "id">,
    token: TokenEntity,
    metadata_uri: string
  ): Promise<any> {
    return this.throwReadonly();
  }

  getFinalizingTokens(): Promise<TokenEntity[]> {
    return this.wrapped.getFinalizingTokens();
  }

  getProjectPreviewImage(id: string): Promise<TokenEntity | null> {
    return this.wrapped.getProjectPreviewImage(id);
  }

  getProjects({
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
  }): Promise<{ items: WorkEntity[]; nextOffset: string | undefined }> {
    return this.wrapped.getProjects({
      limit,
      offset,
      publishedState,
      includeHidden,
      order,
    });
  }

  getProjectTokens2({
    workId,
    limit,
    offset,
    publishedState,
  }: {
    workId: number;
    limit: number;
    offset?: string | number | undefined;
    publishedState: string | null;
  }): Promise<{
    items: TokenEntity[];
    nextOffset: string | number | undefined;
  }> {
    return this.wrapped.getProjectTokens2({
      workId,
      limit,
      offset,
      publishedState,
    });
  }

  getToken({
    workId,
    tokenId,
  }: {
    workId: number;
    tokenId: string;
  }): Promise<TokenEntity | null> {
    return this.wrapped.getToken({ workId, tokenId });
  }

  getAccountProjects({
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
    return this.wrapped.getAccountProjects({
      address,
      limit,
      offset,
      publishedState,
      direction,
    });
  }

  getTokenCount(slug: string): Promise<number> {
    return this.wrapped.getTokenCount(slug);
  }

  lastMintedToken(slug: string): Promise<TokenEntity | null> {
    return this.wrapped.lastMintedToken(slug);
  }

  getProjectBySlug(slug: string): Promise<WorkEntity | null> {
    return this.wrapped.getProjectBySlug(slug);
  }

  getFileUploadById(
    uploadId: string,
    work: WorkEntity
  ): Promise<WorkUploadFile | null> {
    return this.wrapped.getFileUploadById(uploadId, work);
  }

  updateProject(
    id: number,
    request: Partial<FullEditProjectRequest> &
      Required<Pick<FullEditProjectRequest, "hidden" | "startDate">>
  ): Promise<Result<WorkEntity>> {
    return this.throwReadonly();
  }

  deleteWork({ id }: { id: number }): Promise<boolean> {
    return this.throwReadonly();
  }

  saveUploadId(work: WorkEntity, filename: string): Promise<WorkUploadFile> {
    return this.throwReadonly();
  }

  createProject(
    owner: UserEntity,
    request: CreateProjectRequest
  ): Promise<Result<WorkEntity>> {
    return this.throwReadonly();
  }
}
