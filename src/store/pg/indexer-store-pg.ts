// src/repository/pg/indexer-store-pg.ts
import chainInfo from 'src/stargaze/chainInfo';
import { IndexerStoreI } from '../indexerStoreI';
import { TokenEntity } from '../model';
import { RepositoryPg } from './repository-pg';

export class IndexerRepoPg implements IndexerStoreI {
  constructor(private readonly repo: RepositoryPg) {}

  async getLastSweptHeight(): Promise<{ height: bigint; updatedAt: Date }> {
    const row = await this.repo.getBlockHeight(chainInfo().chainId, 'last_swept_height');
    if (!row) return { height: 0n, updatedAt: new Date(0) };
    return { height: BigInt(row.height), updatedAt: row.updatedAt };
  }

  async setLastSweptHeight(height: bigint): Promise<void> {
    await this.repo.upsertBlockHeight(chainInfo().chainId, 'last_swept_height', height);
  }

  async setCurrentPollHeightHeight(height: bigint): Promise<void> {
    await this.repo.upsertBlockHeight(chainInfo().chainId, 'poll_height', height);
  }

  async createWorkToken(token: TokenEntity, sg721: string): Promise<boolean> {
    try {
      await this.repo.createWorkToken({
        workId: parseInt(token.work_id),
        sg721,
        tokenId: parseInt(token.token_id),
        hash: token.hash,
        status: token.status,
        blockHeight: token.blockHeight,
        txHash: token.txHash,
        txMemo: token.txMemo ?? '',
        hashInput: token.hashInput,
      });
      return true;
    } catch {
      return false;
    }
  }
}
