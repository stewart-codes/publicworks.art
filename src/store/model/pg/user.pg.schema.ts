// src/model/pg/user.pg.schema.ts
import { EntitySchema } from 'typeorm';

export interface UserPg {
  id: string; // UUID (UUIDv7 from createId())
  chainId: string;
  address: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UserPgSchema = new EntitySchema<UserPg>({
  name: 'UserPg',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true, name: 'id' },
    chainId: { type: 'varchar', name: 'chain_id', nullable: false },
    address: { type: 'varchar', name: 'address', nullable: false },
    name: { type: 'varchar', name: 'name', nullable: true },
    createdAt: { type: 'timestamptz', name: 'created_at', createDate: true },
    updatedAt: { type: 'timestamptz', name: 'updated_at', updateDate: true },
  },
  uniques: [{ columns: ['chainId', 'address'], name: 'uq_users_chain_address' }],
});
