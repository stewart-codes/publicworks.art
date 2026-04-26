// src/repository/pg/project-adaptor-pg.ts
import chainInfo from 'src/stargaze/chainInfo';
import { Ok, Err, Result } from 'src/util/result';
import { convertToSlug } from 'src/util/slug';
import { WorkEntity, TokenEntity, WorkUploadFile, UserEntity } from '../model';
import { CreateProjectRequest, FullEditProjectRequest } from '../project.types';
import { ProjectRepositoryI } from '../projectRepositoryI';
import { TokenStatuses } from '../types';
import { createId } from '../uuid';
import { decodeCursor, encodeCursor } from './cursor';
import { IndexerRepoPg } from './indexer-store-pg';
import { RepositoryPg } from './repository-pg';
import { WorkPg } from '../model/pg/work.pg.schema';
import { WorkTokenPg } from '../model/pg/work-token.pg.schema';
import { Ensure } from './ensure';

const mapWorkPgToEntity = (w: WorkPg): WorkEntity => {
  const out = new WorkEntity();
  out.id = w.id;
  out.name = w.name;
  out.slug = w.slug;
  out.startDate = w.startDate ?? null;
  out.hidden = w.hidden;
  out.owner = {
    id: w.ownerId,
    address: w.ownerAddress,
    name: '',
    ownedWorks: [],
    createdDate: new Date(0),
    updatedDate: new Date(0),
  };
  out.coverImageCid = w.coverImageCid ?? null;
  out.creator = w.creator;
  out.codeCid = w.codeCid ?? '';
  out.sg721 = w.sg721 ?? null;
  out.minter = w.minter ?? null;
  out.description = w.description;
  out.additionalDescription = w.descriptionAdditional ?? null;
  out.blurb = w.blurb;
  out.resolution = w.resolution ?? null;
  out.selector = w.selector ?? null;
  out.license = w.license ?? null;
  out.externalLink = w.externalLink ?? null;
  out.pixelRatio = w.pixelRatio ?? null;
  out.maxTokens = w.maxTokens;
  out.priceStars = w.priceStars ?? null;
  out.royaltyPercent = w.royaltyPercent ?? null;
  out.royaltyAddress = w.royaltyAddress ?? null;
  out.sg721CodeId = w.sg721CodeId ?? null;
  out.minterCodeId = w.minterCodeId ?? null;
  out.isDutchAuction = w.isDutchAuction;
  out.dutchAuctionEndDate = w.dutchAuctionEndDate ?? null;
  out.dutchAuctionEndPrice =
    w.dutchAuctionEndPrice != null ? parseFloat(w.dutchAuctionEndPrice) : null;
  out.dutchAuctionDeclinePeriodSeconds = w.dutchAuctionDeclinePeriodSeconds ?? null;
  out.dutchAuctionDecayRate =
    w.dutchAuctionDecayRate != null ? parseFloat(w.dutchAuctionDecayRate) : null;
  out.createdDate = w.createdAt;
  out.updatedDate = w.updatedAt;
  out.tokens = null;
  out.workUploadFiles = null;
  return out;
};

const mapTokenPgToEntity = (t: WorkTokenPg): TokenEntity => {
  const out = new TokenEntity();
  out.id = t.id;
  out.token_id = t.tokenId.toString();
  out.work_id = t.workId.toString();
  out.hash = t.hash;
  out.status = t.status;
  out.imageUrl = t.imageUrl ?? null;
  out.metadataUri = t.metadataUrl ?? null;
  out.blockHeight = t.blockHeight;
  out.txHash = t.txHash;
  out.txMemo = t.txMemo ?? '';
  out.hashInput = t.hashInput;
  out.createdDate = t.createdAt;
  out.updatedDate = t.updatedAt;
  out.work = new WorkEntity();
  out.work.id = t.workId
  out.work.sg721 = t.sg721;
  return out;
};

type CursorData = { startDate: string; id: number };

export class RepositoryPgAdaptor implements ProjectRepositoryI {
  private readonly indexer: IndexerRepoPg;

  constructor(private readonly repo: RepositoryPg) {
    this.indexer = new IndexerRepoPg(repo);
  }

  deleteFileUploadEntry(uploadId: string): Promise<void> {
    throw new Error('Not implemented');
  }
  // --- IndexerStoreI delegation ---

  getLastSweptHeight(): Promise<{ height: bigint; updatedAt: Date }> {
    return this.indexer.getLastSweptHeight();
  }

  setLastSweptHeight(height: bigint): Promise<void> {
    return this.indexer.setLastSweptHeight(height);
  }

  setCurrentPollHeightHeight(height: bigint): Promise<void> {
    return this.indexer.setCurrentPollHeightHeight(height);
  }

  createWorkToken(token: TokenEntity, sg721: string): Promise<boolean> {
    return this.indexer.createWorkToken(token, sg721);
  }

  // --- Token queries ---

  async getAllTokensWithStatus(status: TokenStatuses, limit?: number): Promise<TokenEntity[]> {
    const rows = await this.repo.getTokensByStatus(chainInfo().chainId, status, limit);
    return rows.map(mapTokenPgToEntity);
  }

  async getFinalizingTokens(): Promise<TokenEntity[]> {
    const rows = await this.repo.getTokensByStatus(chainInfo().chainId, TokenStatuses.FINALIZING);
    return rows.map(mapTokenPgToEntity);
  }

  async getProjectTokensWithStatus(
    projectId: string,
    status: TokenStatuses,
    limit?: number,
  ): Promise<TokenEntity[]> {
    const rows = await this.repo.getTokensByWorkAndStatus(parseInt(projectId), status, limit);
    return rows.map(mapTokenPgToEntity);
  }

  async setTokenStatus(
    work: Ensure<Required<Pick<WorkEntity, 'sg721' | 'id'>>, 'sg721'>,
    token: TokenEntity,
    status: TokenStatuses,
  ): Promise<void> {
    await this.repo.updateToken(work.sg721, parseInt(token.token_id), { status });
  }

  async updatePartial(
    work: Ensure<Required<Pick<WorkEntity, 'sg721' | 'id'>>, 'sg721'>,
    token: TokenEntity,
    updates: Partial<TokenEntity>,
  ): Promise<void> {
    await this.repo.updateToken(work.sg721, parseInt(token.token_id), {
      status: updates.status,
      imageUrl: updates.imageUrl ?? undefined,
      metadataUrl: updates.metadataUri ?? undefined,
    });
  }

  async setTokenImage(
    work: Ensure<Required<Pick<WorkEntity, 'sg721' | 'id'>>, 'sg721'>,
    token: TokenEntity,
    image_url: string,
  ): Promise<void> {
    await this.repo.updateToken(work.sg721, parseInt(token.token_id), { imageUrl: image_url });
  }

  async setTokenFinalMetadata(
    work: Ensure<Required<Pick<WorkEntity, 'sg721' | 'id'>>, 'sg721'>,
    token: TokenEntity,
    metadata_uri: string,
  ): Promise<void> {
    await this.repo.updateToken(work.sg721, parseInt(token.token_id), {
      metadataUrl: metadata_uri,
    });
  }

  async getProjectAndTokenById(
    projectId: string,
    tokenId: string,
  ): Promise<{ project: WorkEntity; token: TokenEntity } | null> {
    const work = await this.repo.getWorkById(chainInfo().chainId, parseInt(projectId));
    if (!work) return null;
    const token = await this.repo.getTokenBySg721AndTokenId(work.sg721 ?? '', parseInt(tokenId));
    if (!token) return null;
    return { project: mapWorkPgToEntity(work), token: mapTokenPgToEntity(token) };
  }

  async getToken({
    workId,
    tokenId,
  }: {
    workId: number;
    tokenId: string;
  }): Promise<TokenEntity | null> {
    const work = await this.repo.getWorkById(chainInfo().chainId, (workId));
    if (!work || !work.sg721) return null;
    const token = await this.repo.getTokenBySg721AndTokenId(work.sg721, parseInt(tokenId));
    return token ? mapTokenPgToEntity(token) : null;
  }

  async getProjectPreviewImage(id: string): Promise<TokenEntity | null> {
    const work = await this.repo.getWorkById(chainInfo().chainId, parseInt(id));
    if (!work || !work.sg721) return null;
    const { items } = await this.repo.getTokensByWork(parseInt(id), { limit: 1 });
    return items.length > 0 ? mapTokenPgToEntity(items[0]) : null;
  }

  async getProjectTokens2({
    workId,
    limit,
    offset,
  }: {
    workId: number;
    limit: number;
    offset?: string | number | undefined;
    publishedState: 'PUBLISHED' | 'UNPUBLISHED' | 'ALL' | null;
  }): Promise<{ items: TokenEntity[]; nextOffset: string | number | undefined }> {
    const afterTokenId = offset != null ? parseInt(offset.toString()) : undefined;
    const { items, nextTokenId } = await this.repo.getTokensByWork(workId, { limit, afterTokenId });
    return {
      items: items.map(mapTokenPgToEntity),
      nextOffset: nextTokenId?.toString(),
    };
  }

  async getTokenCount(slug: string): Promise<number> {
    const work = await this.repo.getWorkBySlug(slug);
    if (!work) return 0;
    return this.repo.countTokensByWork(work.id);
  }

  async lastMintedToken(slug: string): Promise<TokenEntity | null> {
    const work = await this.repo.getWorkBySlug(slug);
    if (!work) return null;
    const token = await this.repo.getLastTokenByWork(work.id);
    return token ? mapTokenPgToEntity(token) : null;
  }

  // --- Work / Project queries ---

  async getProjectForSg721(sg721: string): Promise<WorkEntity | null> {
    const row = await this.repo.getWorkBySg721(chainInfo().chainId, sg721);
    return row ? mapWorkPgToEntity(row) : null;
  }

  async getProjectForId(id: string): Promise<WorkEntity | null> {
    const row = await this.repo.getWorkById(chainInfo().chainId, parseInt(id));
    return row ? mapWorkPgToEntity(row) : null;
  }

  async getProject(idIn: string | number): Promise<WorkEntity | null> {
    const id = typeof idIn === 'string' ? parseInt(idIn) : idIn;
    const row = await this.repo.getWorkById(chainInfo().chainId, id);
    return row ? mapWorkPgToEntity(row) : null;
  }

  async getProjectBySlug(slug: string): Promise<WorkEntity | null> {
    const row = await this.repo.getWorkBySlug(slug);
    return row ? mapWorkPgToEntity(row) : null;
  }

  async getProjects({
    limit,
    offset,
    publishedState,
    includeHidden,
    order = 'desc',
  }: {
    limit: number;
    offset?: string | number | undefined;
    publishedState?: string | null;
    includeHidden: boolean;
    order?: 'desc' | 'asc';
  }): Promise<{ items: WorkEntity[]; nextOffset: string | undefined }> {
    if (typeof offset === 'number')
      throw new Error('numeric offset not supported for postgres; pass a string cursor');
    let cursor: CursorData | undefined;
    if (offset && typeof offset === 'string') {
      try {
        cursor = decodeCursor<CursorData>(offset);
      } catch {
        cursor = undefined;
      }
    }

    let publishStatus: number | null | undefined;
    if (publishedState === 'PUBLISHED') publishStatus = 1;
    else if (publishedState === 'UNPUBLISHED') publishStatus = 0;
    else publishStatus = undefined;

    const { items, nextCursor } = await this.repo.findPublishedWorks({
      chainId: chainInfo().chainId,
      includeHidden,
      publishStatus,
      limit,
      cursor,
      order,
    });

    return {
      items: items.map(mapWorkPgToEntity),
      nextOffset: nextCursor ? encodeCursor(nextCursor) : undefined,
    };
  }

  async getAccountProjects({
    address,
    limit,
    offset,
    direction = 'DESC',
  }: {
    address: string;
    limit: number;
    offset?: string | undefined;
    publishedState?: string | null;
    direction: 'ASC' | 'DESC';
  }): Promise<{ items: WorkEntity[]; nextOffset: string | undefined }> {
    const user = await this.repo.getUserByAddress(chainInfo().chainId, address);
    if (!user) return { items: [], nextOffset: undefined };

    let cursor: CursorData | undefined;
    if (offset) {
      try {
        cursor = decodeCursor<CursorData>(offset);
      } catch {
        cursor = undefined;
      }
    }

    const { items, nextCursor } = await this.repo.findWorksByOwner({
      chainId: chainInfo().chainId,
      ownerId: user.id,
      limit,
      cursor,
      direction,
    });

    return {
      items: items.map(mapWorkPgToEntity),
      nextOffset: nextCursor ? encodeCursor(nextCursor) : undefined,
    };
  }

  // --- File uploads ---

  async saveUploadId(work: WorkEntity, filename: string): Promise<WorkUploadFile> {
    const id = createId();
    const row = await this.repo.saveUploadFile(id, (work.id), filename);
    return {
      id: row.id,
      filename: row.filename,
      work,
      createdDate: row.createdAt,
      updatedDate: row.updatedAt,
    };
  }

  async getFileUploadById(uploadId: string, work: WorkEntity): Promise<WorkUploadFile | null> {
    const row = await this.repo.getUploadFileById(uploadId);
    if (!row) return null;
    return {
      id: row.id,
      filename: row.filename,
      work,
      createdDate: row.createdAt,
      updatedDate: row.updatedAt,
    };
  }

  // --- Mutations ---

  async createProject(
    owner: UserEntity,
    request: CreateProjectRequest,
  ): Promise<Result<WorkEntity>> {
    try {
      const slug = convertToSlug(request.name);
      const row = await this.repo.createWork({
        chainId: chainInfo().chainId,
        name: request.name,
        slug,
        ownerId: owner.id,
        ownerAddress: owner.address,
        creator: owner.address,
        hidden: false,
        isDutchAuction: false,
        maxTokens: request.maxTokens ?? 0,
        startDate: request.startDate ? new Date(request.startDate) : new Date(0),//blag maybe a bug
        description: request.description ?? '',
        blurb: request.blurb ?? '',
        resolution: request.resolution ?? '1080:1080',
        selector: request.selector ?? 'canvas',
        pixelRatio: request.pixelRatio ?? 1,
        priceStars: request.priceStars ?? 50,
        royaltyPercent: request.royaltyPercent ?? 5,
        royaltyAddress: request.royaltyAddress ?? null,
        publishStatus: 0,
        sg721: null,
        minter: null,
        codeCid: null,
        coverImageCid: null,
        descriptionAdditional: null,
        externalLink: null,
        sg721CodeId: null,
        minterCodeId: null,
        dutchAuctionEndDate: null,
        dutchAuctionEndPrice: null,
        dutchAuctionDeclinePeriodSeconds: null,
        dutchAuctionDecayRate: null,
        license: null,
      });
      return Ok(mapWorkPgToEntity(row));
    } catch (e) {
      return Err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async updateProject(
    id: number,
    request: Partial<FullEditProjectRequest>,
  ): Promise<Result<WorkEntity>> {
    try {
      // Need publishStatus — derive from sg721 in request, or read current row
      let publishStatus: number | undefined;
      if ('sg721' in request) {
        publishStatus = request.sg721 ? 1 : 0;
      } else {
        const current = await this.repo.getWorkById(chainInfo().chainId, id);
        publishStatus = current?.sg721 ? 1 : 0;
      }

      const updates: Partial<Parameters<RepositoryPg['updateWork']>[2]> = {};
      if (request.name !== undefined) updates.name = request.name;
      if (request.blurb !== undefined) updates.blurb = request.blurb;
      if (request.description !== undefined) updates.description = request.description;
      if (request.additionalDescription !== undefined)
        updates.descriptionAdditional = request.additionalDescription ?? null;
      if (request.externalLink !== undefined) updates.externalLink = request.externalLink ?? null;
      if (request.startDate !== undefined) updates.startDate = new Date(request.startDate);
      if (request.resolution !== undefined) updates.resolution = request.resolution;
      if (request.selector !== undefined) updates.selector = request.selector;
      if (request.pixelRatio !== undefined) updates.pixelRatio = request.pixelRatio;
      if (request.priceStars !== undefined) updates.priceStars = request.priceStars;
      if (request.maxTokens !== undefined) updates.maxTokens = request.maxTokens;
      if (request.royaltyPercent !== undefined) updates.royaltyPercent = request.royaltyPercent;
      if (request.royaltyAddress !== undefined)
        updates.royaltyAddress = request.royaltyAddress ?? null;
      if (request.hidden !== undefined) updates.hidden = request.hidden;
      if (request.sg721 !== undefined) updates.sg721 = request.sg721 ?? null;
      if (request.minter !== undefined) updates.minter = request.minter ?? null;
      if (request.codeCid !== undefined) updates.codeCid = request.codeCid ?? null;
      if (request.coverImageCid !== undefined)
        updates.coverImageCid = request.coverImageCid ?? null;
      if (request.license !== undefined) updates.license = request.license ?? null;
      if (request.sg721CodeId !== undefined) updates.sg721CodeId = request.sg721CodeId ?? null;
      if (request.minterCodeId !== undefined) updates.minterCodeId = request.minterCodeId ?? null;
      if (request.isDutchAuction !== undefined) updates.isDutchAuction = request.isDutchAuction;
      if (request.dutchAuctionEndPrice !== undefined)
        updates.dutchAuctionEndPrice =
          request.dutchAuctionEndPrice != null ? request.dutchAuctionEndPrice.toString() : null;
      if (request.dutchAuctionEndDate !== undefined)
        updates.dutchAuctionEndDate = request.dutchAuctionEndDate
          ? new Date(request.dutchAuctionEndDate)
          : null;
      if (request.dutchAuctionDeclinePeriodSeconds !== undefined)
        updates.dutchAuctionDeclinePeriodSeconds = request.dutchAuctionDeclinePeriodSeconds ?? null;
      if (request.dutchAuctionDecayRate !== undefined)
        updates.dutchAuctionDecayRate =
          request.dutchAuctionDecayRate != null ? request.dutchAuctionDecayRate.toString() : null;
      if (request.creator !== undefined) updates.creator = request.creator;
      updates.publishStatus = publishStatus;

      const row = await this.repo.updateWork(chainInfo().chainId, id, updates);
      if (!row) return Err(new Error('work not found'));
      return Ok(mapWorkPgToEntity(row));
    } catch (e) {
      return Err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async deleteWork({ id }: { id: number }): Promise<boolean> {
    try {
      await this.repo.deleteWork(chainInfo().chainId, id);
      return true;
    } catch {
      return false;
    }
  }
}
