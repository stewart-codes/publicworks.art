// src/repository/pg/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { WorkPgSchema } from '../model/pg/work.pg.schema';
import { WorkTokenPgSchema } from '../model/pg/work-token.pg.schema';
import { UserPgSchema } from '../model/pg/user.pg.schema';
import { BlockHeightPgSchema } from '../model/pg/block-height.pg.schema';
import { WorkUploadFilePgSchema } from '../model/pg/work-upload-file.pg.schema';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    WorkPgSchema,
    WorkTokenPgSchema,
    UserPgSchema,
    BlockHeightPgSchema,
    WorkUploadFilePgSchema,
  ],
  migrations: [],
  logging: process.env.PG_LOGGING_ENABLED === 'true',
});

