// src/repository/pg/repository-pg.ts
import { DataSource, Repository } from 'typeorm';
import { WorkPg } from '../model/pg/work.pg.schema';
import { WorkTokenPg } from '../model/pg/work-token.pg.schema';
import { BlockHeightPg } from '../model/pg/block-height.pg.schema';
import { UserPg } from '../model/pg/user.pg.schema';
import { WorkUploadFilePg } from '../model/pg/work-upload-file.pg.schema';
import { TokenStatuses } from '../types';

export type CreateWorkInput = Omit<WorkPg, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateWorkTokenInput = Omit<
  WorkTokenPg,
  'id' | 'imageUrl' | 'metadataUrl' | 'createdAt' | 'updatedAt'
>;

export class RepositoryPg {
  private initializedPromise: Promise<void> | null = null;
  constructor(private readonly ds: DataSource) {
    this.initializedPromise = ds.isInitialized ? Promise.resolve() : (ds.initialize() as unknown as Promise<void>);
  }

  private workRepo(): Repository<WorkPg> {
    return this.ds.getRepository<WorkPg>('WorkPg');
  }
  private tokenRepo(): Repository<WorkTokenPg> {
    return this.ds.getRepository<WorkTokenPg>('WorkTokenPg');
  }
  private userRepo(): Repository<UserPg> {
    return this.ds.getRepository<UserPg>('UserPg');
  }
  private heightRepo(): Repository<BlockHeightPg> {
    return this.ds.getRepository<BlockHeightPg>('BlockHeightPg');
  }
  private uploadRepo(): Repository<WorkUploadFilePg> {
    return this.ds.getRepository<WorkUploadFilePg>('WorkUploadFilePg');
  }

  // --- Works ---

  async createWork(input: CreateWorkInput): Promise<WorkPg> {
    await this.initializedPromise;
    return this.workRepo().save({ ...input, updatedAt: new Date() } as WorkPg);
  }

  async getWorkById(chainId: string, id: number): Promise<WorkPg | null> {
    await this.initializedPromise;
    return this.workRepo().findOne({ where: { id, chainId } });
  }

  async getWorkBySlug(slug: string): Promise<WorkPg | null> {
    await this.initializedPromise;
    return this.workRepo().findOne({ where: { slug } });
  }

  async getWorkBySg721(chainId: string, sg721: string): Promise<WorkPg | null> {
    await this.initializedPromise;
    return this.workRepo().findOne({ where: { chainId, sg721 } });
  }

  async updateWork(
    chainId: string,
    id: number,
    updates: Partial<Omit<WorkPg, 'id' | 'chainId' | 'createdAt'>>,
  ): Promise<WorkPg | null> {
    await this.initializedPromise;
    await this.workRepo().update({ id, chainId }, { ...updates, updatedAt: new Date() });
    return this.getWorkById(chainId, id);
  }

  async deleteWork(chainId: string, id: number): Promise<void> {
    await this.initializedPromise;
    await this.workRepo().delete({ id, chainId });
  }

  // Uses QueryBuilder so TypeORM handles snake_case → camelCase column mapping automatically.
  async findPublishedWorks({
    chainId,
    includeHidden,
    publishStatus,
    limit,
    cursor,
    order = 'desc',
  }: {
    chainId: string;
    includeHidden: boolean;
    publishStatus?: number | null;
    limit: number;
    cursor?: { startDate: string; id: number };
    order?: 'asc' | 'desc';
  }): Promise<{ items: WorkPg[]; nextCursor: { startDate: string; id: number } | undefined }> {
    await this.initializedPromise;
    const dir = order.toUpperCase() as 'ASC' | 'DESC';
    let qb = this.workRepo().createQueryBuilder('w').where('w.chainId = :chainId', { chainId });

    if (!includeHidden) qb = qb.andWhere('w.hidden = :hidden', { hidden: false });
    if (publishStatus !== null && publishStatus !== undefined) {
      qb = qb.andWhere('w.publishStatus = :publishStatus', { publishStatus });
    }
    if (cursor) {
      if (order === 'desc') {
        qb = qb.andWhere('(w.startDate < :sd OR (w.startDate = :sd AND w.id < :cid))', {
          sd: new Date(cursor.startDate),
          cid: cursor.id,
        });
      } else {
        qb = qb.andWhere('(w.startDate > :sd OR (w.startDate = :sd AND w.id > :cid))', {
          sd: new Date(cursor.startDate),
          cid: cursor.id,
        });
      }
    }

    const rows = await qb
      .orderBy('w.startDate', dir)
      .addOrderBy('w.id', dir)
      .take(limit + 1)
      .getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    return {
      items,
      nextCursor: hasMore ? { startDate: last.startDate.toISOString(), id: last.id } : undefined,
    };
  }

  async findWorksByOwner({
    chainId,
    ownerId,
    limit,
    cursor,
    direction = 'DESC',
  }: {
    chainId: string;
    ownerId: string;
    limit: number;
    cursor?: { startDate: string; id: number };
    direction?: 'ASC' | 'DESC';
  }): Promise<{ items: WorkPg[]; nextCursor: { startDate: string; id: number } | undefined }> {
    await this.initializedPromise;
    let qb = this.workRepo()
      .createQueryBuilder('w')
      .where('w.chainId = :chainId', { chainId })
      .andWhere('w.ownerId = :ownerId', { ownerId });

    if (cursor) {
      if (direction === 'DESC') {
        qb = qb.andWhere('(w.startDate < :sd OR (w.startDate = :sd AND w.id < :cid))', {
          sd: new Date(cursor.startDate),
          cid: cursor.id,
        });
      } else {
        qb = qb.andWhere('(w.startDate > :sd OR (w.startDate = :sd AND w.id > :cid))', {
          sd: new Date(cursor.startDate),
          cid: cursor.id,
        });
      }
    }

    const rows = await qb
      .orderBy('w.startDate', direction)
      .addOrderBy('w.id', direction)
      .take(limit + 1)
      .getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    return {
      items,
      nextCursor: hasMore ? { startDate: last.startDate.toISOString(), id: last.id } : undefined,
    };
  }

  // --- Work Tokens ---

  async createWorkToken(input: CreateWorkTokenInput): Promise<WorkTokenPg> {
    await this.initializedPromise;
    return this.tokenRepo().save({
      ...input,
      imageUrl: null,
      metadataUrl: null,
      updatedAt: new Date(),
    } as WorkTokenPg);
  }

  async getTokenBySg721AndTokenId(sg721: string, tokenId: number): Promise<WorkTokenPg | null> {
    await this.initializedPromise;
    return this.tokenRepo().findOne({ where: { sg721, tokenId } });
  }

  // QueryBuilder used for all token queries so TypeORM handles snake_case → camelCase mapping.
  async getTokensByStatus(
    chainId: string,
    status: TokenStatuses,
    limit?: number,
  ): Promise<WorkTokenPg[]> {
    await this.initializedPromise;
    let qb = this.tokenRepo()
      .createQueryBuilder('wt')
      .innerJoin('WorkPg', 'w', 'wt.workId = w.id')
      .where('w.chainId = :chainId', { chainId })
      .andWhere('wt.status = :status', { status });
    if (limit) qb = qb.take(limit);
    return qb.getMany();
  }

  async getTokensByWorkAndStatus(
    workId: number,
    status: TokenStatuses,
    limit?: number,
  ): Promise<WorkTokenPg[]> {
    await this.initializedPromise;
    let qb = this.tokenRepo()
      .createQueryBuilder('wt')
      .where('wt.workId = :workId', { workId })
      .andWhere('wt.status = :status', { status })
      .orderBy('wt.tokenId', 'ASC');
    if (limit) qb = qb.take(limit);
    return qb.getMany();
  }

  async updateToken(
    sg721: string,
    tokenId: number,
    updates: Partial<Pick<WorkTokenPg, 'status' | 'imageUrl' | 'metadataUrl'>>,
  ): Promise<void> {
    await this.initializedPromise;
    await this.tokenRepo().update({ sg721, tokenId }, { ...updates, updatedAt: new Date() });
  }

  async getTokensByWork(
    workId: number,
    { limit, afterTokenId }: { limit: number; afterTokenId?: number },
  ): Promise<{ items: WorkTokenPg[]; nextTokenId: number | undefined }> {
    await this.initializedPromise;
    let qb = this.tokenRepo()
      .createQueryBuilder('wt')
      .where('wt.workId = :workId', { workId })
      .orderBy('wt.tokenId', 'ASC');
    if (afterTokenId !== undefined)
      qb = qb.andWhere('wt.tokenId > :afterTokenId', { afterTokenId });
    const rows = await qb.take(limit + 1).getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return { items, nextTokenId: hasMore ? items[items.length - 1].tokenId : undefined };
  }

  // --- Block Heights ---

  async upsertBlockHeight(chainId: string, name: string, height: bigint): Promise<void> {
    await this.initializedPromise;
      await this.ds.query(
      `INSERT INTO block_heights (chain_id, name, height, updated_at) VALUES ($1, $2, $3, NOW())
       ON CONFLICT (chain_id, name) DO UPDATE SET height = EXCLUDED.height, updated_at = NOW()`,
      [chainId, name, height.toString()],
    );
  }

  async getBlockHeight(chainId: string, name: string): Promise<BlockHeightPg | null> {
    await this.initializedPromise;
    return this.heightRepo().findOne({ where: { chainId, name } });
  }

  // --- Users ---

  async createUser(input: Omit<UserPg, 'createdAt' | 'updatedAt'>): Promise<UserPg> {
    await this.initializedPromise;
    return this.userRepo().save({ ...input, updatedAt: new Date() } as UserPg);
  }

  async getUserByAddress(chainId: string, address: string): Promise<UserPg | null> {
    await this.initializedPromise;
    return this.userRepo().findOne({ where: { chainId, address } });
  }

  async createUserIfNotExists(chainId: string, address: string, id: string): Promise<UserPg> {
    await this.initializedPromise;
    await this.ds.query(
      `INSERT INTO users (id, chain_id, address, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (chain_id, address) DO NOTHING`,
      [id, chainId, address],
    );
    return this.getUserByAddress(chainId, address) as Promise<UserPg>;
  }

  // --- Work Upload Files ---

  async saveUploadFile(id: string, workId: number, filename: string): Promise<WorkUploadFilePg> {
    await this.initializedPromise;
    return this.uploadRepo().save({
      id,
      workId,
      filename,
      updatedAt: new Date(),
    } as WorkUploadFilePg);
  }

  async getUploadFileById(id: string): Promise<WorkUploadFilePg | null> {
    await this.initializedPromise;
    return this.uploadRepo().findOne({ where: { id } });
  }

  async countTokensByWork(workId: number): Promise<number> {
    await this.initializedPromise;
    const result: { count: string }[] = await this.ds.query(
      `SELECT COUNT(*) as count FROM work_tokens WHERE work_id = $1`,
      [workId],
    );
    return parseInt(result[0].count, 10);
  }

  async getLastTokenByWork(workId: number): Promise<WorkTokenPg | null> {
    await this.initializedPromise;
    return this.tokenRepo()
      .createQueryBuilder('wt')
      .where('wt.workId = :workId', { workId })
      .orderBy('wt.tokenId', 'DESC')
      .take(1)
      .getOne();
  }

  getDataSource(): DataSource {
    return this.ds;
  }
}
