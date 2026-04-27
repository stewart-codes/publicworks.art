// src/model/pg/work-token.pg.schema.ts
import { EntitySchema } from "typeorm";

export interface WorkTokenPg {
  id: string;
  workId: number;
  sg721: string;
  tokenId: number;
  hash: string;
  status: number;
  imageUrl: string | null;
  metadataUrl: string | null;
  blockHeight: string;
  txHash: string;
  txMemo: string;
  hashInput: string;
  createdAt: Date;
  updatedAt: Date;
}

export const WorkTokenPgSchema = new EntitySchema<WorkTokenPg>({
  name: "WorkTokenPg",
  tableName: "work_tokens",
  columns: {
    id: { type: "bigint", primary: true, generated: "increment", name: "id" },
    workId: { type: "int", name: "work_id", nullable: false },
    sg721: { type: "varchar", name: "sg721", nullable: false },
    tokenId: { type: "int", name: "token_id", nullable: false },
    hash: { type: "varchar", name: "hash", nullable: false },
    status: { type: "smallint", name: "status", nullable: false },
    imageUrl: { type: "varchar", name: "image_url", nullable: true },
    metadataUrl: { type: "varchar", name: "metadata_url", nullable: true },
    blockHeight: { type: "varchar", name: "block_height", nullable: false },
    txHash: { type: "varchar", name: "tx_hash", nullable: false },
    txMemo: { type: "varchar", name: "tx_memo", nullable: false, default: "" },
    hashInput: { type: "varchar", name: "hash_input", nullable: false },
    createdAt: { type: "timestamptz", name: "created_at", createDate: true },
    updatedAt: { type: "timestamptz", name: "updated_at", updateDate: true },
  },
  uniques: [
    { columns: ["workId", "tokenId"], name: "uq_work_tokens_work_token" },
    { columns: ["sg721", "tokenId"], name: "uq_work_tokens_sg721_token" },
  ],
  indices: [
    { columns: ["status"], name: "idx_work_tokens_status" },
    { columns: ["workId", "status"], name: "idx_work_tokens_work_status" },
  ],
});
