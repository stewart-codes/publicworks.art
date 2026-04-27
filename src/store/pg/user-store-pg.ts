// src/repository/pg/user-store-pg.ts
import chainInfo from "src/stargaze/chainInfo";
import { UserEntity } from "../model";
import { UserPg } from "../model/pg/user.pg.schema";
import { UserRepoI } from "../user.types";
import { createId } from "../uuid";
import { RepositoryPg } from "./repository-pg";

const mapUserPgToEntity = (u: UserPg): UserEntity => {
  const e = new UserEntity();
  e.id = u.id;
  e.address = u.address;
  e.name = u.name ?? "";
  e.createdDate = u.createdAt;
  e.updatedDate = u.updatedAt;
  e.ownedWorks = [];
  return e;
};

export class UserRepoPg implements UserRepoI {
  constructor(private readonly repo: RepositoryPg) {}

  async getUser(address: string): Promise<UserEntity | null> {
    const row = await this.repo.getUserByAddress(chainInfo().chainId, address);
    return row ? mapUserPgToEntity(row) : null;
  }

  async createIfNeeded(address: string): Promise<UserEntity | null> {
    const row = await this.repo.createUserIfNotExists(
      chainInfo().chainId,
      address,
      createId()
    );
    return row ? mapUserPgToEntity(row) : null;
  }
}
