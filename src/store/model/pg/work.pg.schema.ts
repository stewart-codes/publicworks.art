// src/model/pg/work.pg.schema.ts
import { EntitySchema } from "typeorm";

export interface WorkPg {
  id: number;
  chainId: string;
  name: string;
  slug: string;
  codeCid: string | null;
  coverImageCid: string | null;
  creator: string;
  hidden: boolean;
  ownerId: string;
  ownerAddress: string;
  sg721: string | null;
  minter: string | null;
  publishStatus: number;
  description: string;
  descriptionAdditional: string | null;
  blurb: string;
  startDate: Date;
  resolution: string;
  selector: string;
  license: string | null;
  externalLink: string | null;
  pixelRatio: number;
  maxTokens: number;
  priceStars: number;
  royaltyPercent: number;
  royaltyAddress: string | null;
  sg721CodeId: number | null;
  minterCodeId: number | null;
  isDutchAuction: boolean;
  dutchAuctionEndDate: Date | null;
  dutchAuctionEndPrice: string | null;
  dutchAuctionDeclinePeriodSeconds: number | null;
  dutchAuctionDecayRate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const WorkPgSchema = new EntitySchema<WorkPg>({
  name: "WorkPg",
  tableName: "works",
  columns: {
    id: { type: "int", primary: true, generated: "increment", name: "id" },
    chainId: { type: "varchar", name: "chain_id", nullable: false },
    name: { type: "varchar", name: "name", nullable: false },
    slug: { type: "varchar", name: "slug", nullable: false, unique: true },
    codeCid: { type: "varchar", name: "code_cid", nullable: true },
    coverImageCid: { type: "varchar", name: "cover_image_cid", nullable: true },
    creator: { type: "varchar", name: "creator", nullable: false },
    hidden: {
      type: "boolean",
      name: "hidden",
      nullable: false,
      default: false,
    },
    ownerId: { type: "uuid", name: "owner_id", nullable: false },
    ownerAddress: { type: "varchar", name: "owner_address", nullable: false },
    sg721: { type: "varchar", name: "sg721", nullable: true },
    minter: { type: "varchar", name: "minter", nullable: true },
    publishStatus: {
      type: "smallint",
      name: "publish_status",
      nullable: false,
      default: 0,
    },
    description: {
      type: "text",
      name: "description",
      nullable: false,
      default: "",
    },
    descriptionAdditional: {
      type: "text",
      name: "description_additional",
      nullable: true,
    },
    blurb: { type: "text", name: "blurb", nullable: false, default: "" },
    startDate: { type: "timestamptz", name: "start_date", nullable: false },
    resolution: {
      type: "varchar",
      name: "resolution",
      nullable: false,
      default: "1080:1080",
    },
    selector: {
      type: "varchar",
      name: "selector",
      nullable: false,
      default: "canvas",
    },
    license: { type: "varchar", name: "license", nullable: true },
    externalLink: { type: "varchar", name: "external_link", nullable: true },
    pixelRatio: {
      type: "smallint",
      name: "pixel_ratio",
      nullable: false,
      default: 1,
    },
    maxTokens: { type: "int", name: "max_tokens", nullable: false },
    priceStars: {
      type: "int",
      name: "price_stars",
      nullable: false,
      default: 50,
    },
    royaltyPercent: {
      type: "smallint",
      name: "royalty_percent",
      nullable: false,
      default: 5,
    },
    royaltyAddress: {
      type: "varchar",
      name: "royalty_address",
      nullable: true,
    },
    sg721CodeId: { type: "int", name: "sg721_code_id", nullable: true },
    minterCodeId: { type: "int", name: "minter_code_id", nullable: true },
    isDutchAuction: {
      type: "boolean",
      name: "is_dutch_auction",
      nullable: false,
      default: false,
    },
    dutchAuctionEndDate: {
      type: "timestamptz",
      name: "dutch_auction_end_date",
      nullable: true,
    },
    dutchAuctionEndPrice: {
      type: "decimal",
      precision: 18,
      scale: 6,
      name: "dutch_auction_end_price",
      nullable: true,
    },
    dutchAuctionDeclinePeriodSeconds: {
      type: "int",
      name: "dutch_auction_decline_period_seconds",
      nullable: true,
    },
    dutchAuctionDecayRate: {
      type: "decimal",
      precision: 10,
      scale: 8,
      name: "dutch_auction_decay_rate",
      nullable: true,
    },
    createdAt: { type: "timestamptz", name: "created_at", createDate: true },
    updatedAt: { type: "timestamptz", name: "updated_at", updateDate: true },
  },
  indices: [
    {
      columns: ["chainId", "ownerId", "startDate", "id"],
      name: "idx_works_chain_owner",
    },
    {
      columns: ["chainId", "hidden", "publishStatus", "startDate", "id"],
      name: "idx_works_chain_published",
    },
    {
      columns: ["chainId", "hidden", "startDate", "id"],
      name: "idx_works_chain_hidden_all",
    },
    {
      columns: ["chainId", "publishStatus", "startDate", "id"],
      name: "idx_works_chain_visible",
    },
    { columns: ["chainId", "startDate", "id"], name: "idx_works_chain_all" },
    { columns: ["chainId", "sg721"], name: "idx_works_chain_sg721" },
  ],
});
