// src/model/pg/block-height.pg.schema.ts
import { EntitySchema } from "typeorm";

export interface BlockHeightPg {
  id: number;
  chainId: string;
  name: string;
  height: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BlockHeightPgSchema = new EntitySchema<BlockHeightPg>({
  name: "BlockHeightPg",
  tableName: "block_heights",
  columns: {
    id: { type: "int", primary: true, generated: "increment", name: "id" },
    chainId: { type: "varchar", name: "chain_id", nullable: false },
    name: { type: "varchar", name: "name", nullable: false },
    height: { type: "bigint", name: "height", nullable: false },
    createdAt: { type: "timestamptz", name: "created_at", createDate: true },
    updatedAt: { type: "timestamptz", name: "updated_at", updateDate: true },
  },
  uniques: [
    { columns: ["chainId", "name"], name: "uq_block_heights_chain_name" },
  ],
});
