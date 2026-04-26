import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  IndexerRepoDdb,
  IndexerRepoDdbAdaptor,
  RepositoryDbbAdaptor,
  RepositoryDdb,
} from "./ddb";
import { UserRepoDdbAdaptor } from "./ddb/adaptor/user-adaptor";
import { UserRepoDdb } from "./ddb/user-repo-ddb";
import { IndexerStoreI } from "./indexerStoreI";
import { ProjectRepositoryI } from "./projectRepositoryI";
import { UserRepoI } from "./user.types";
import { RepositoryPgAdaptor } from "./pg/project-adaptor-pg";
import { UserRepoPg } from "./pg/user-store-pg";
import { IndexerRepoPg } from "./pg/indexer-store-pg";
import { AppDataSource } from "./pg/data-source";
import { RepositoryPg } from "./pg/repository-pg";
import { ReadonlyProjectRepository } from "./project-repository-readonly";

type Stores = {
  project: ProjectRepositoryI;
  user: UserRepoI;
  indexer: IndexerStoreI;
};

 type Services = {
  initialize: () => Promise<void>;
  close: () => Promise<void>;
 } & Stores
// Call once at startup before constructing the app when DB_DRIVER=postgres. No-op for dynamo.
export const initDb = async (): Promise<void> => {
  if (usePg()) {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  }
};

const usePg=()=>{
  return (process.env.DB_DRIVER ?? 'dynamo') === 'postgres'
}

const buildDynamoServices = (): Services => {
  const tableName = process.env.DDB_TABLE_NAME;
  if (!tableName) throw new Error('DDB_TABLE_NAME is not set');
  const client = new DynamoDBClient();
  const adaptor = new RepositoryDbbAdaptor(new RepositoryDdb(tableName, client), new UserRepoDdb(tableName, client));
  return {
    initialize: async (): Promise<void> => {
      return;
    },
    close: async (): Promise<void> => {
      return;
    },

    project: new ReadonlyProjectRepository(adaptor),
    user: new UserRepoDdbAdaptor(new UserRepoDdb(tableName, client)),
    indexer: adaptor,
  };
};

const buildPostgresServices = (): Services => {
  // if (!AppDataSource.isInitialized) {
  //   throw new Error('AppDataSource not initialized — call await initDb() before factory()');
  // }
  const repo = new RepositoryPg(AppDataSource);
  let initPromise: Promise<unknown> | null = null;
  return {
    initialize: async (): Promise<void> => {
      if (!AppDataSource.isInitialized && !initPromise) initPromise = AppDataSource.initialize();
      return initPromise as Promise<void>;
    },
    close: async (): Promise<void> => {
      AppDataSource.destroy()
    },
    project: new ReadonlyProjectRepository(new RepositoryPgAdaptor(repo)),
    user: new UserRepoPg(repo),
    indexer: new IndexerRepoPg(repo),
  };
};

// Synchronous — safe to call from synchronous Express app constructors.
// Requires initDb() to have been awaited first when DB_DRIVER=postgres.
export const factory = (): Services => {
  const driver = process.env.DB_DRIVER ?? 'dynamo';
  return driver === 'postgres' ? buildPostgresServices() : buildDynamoServices();
};


let storesInternal: Stores | null = null;
export const stores = (): Stores => {
  if (storesInternal) {
    return storesInternal;
  }

  if (usePg()){
    const svc = buildPostgresServices();
    storesInternal = {
      project: (svc.project),
      user: svc.user,
      indexer: svc.indexer,
    };
    return storesInternal;
  }

  
  const client = new DynamoDBClient();
  const tableName = process.env.DDB_TABLE_NAME;
  if (!tableName) {
    throw new Error("DDB_TABLE_NAME is not set");
  }
  const userStore = new UserRepoDdb(tableName, client);
  const user = new UserRepoDdbAdaptor(userStore);
  const storesNew: Stores = {
    project: new ReadonlyProjectRepository(
      new RepositoryDbbAdaptor(new RepositoryDdb(tableName, client), userStore)
    ),
    user: user,
    indexer: new IndexerRepoDdbAdaptor(new IndexerRepoDdb(tableName, client)),
  };
  storesInternal = storesNew;
  return storesNew;
};
