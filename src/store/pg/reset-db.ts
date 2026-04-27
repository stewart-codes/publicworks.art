import { AppDataSource } from "./data-source";

export const resetDb = async (): Promise<void> => {
  await AppDataSource.initialize();
  try {
    //create the databse
    //
    await AppDataSource.dropDatabase();
    await AppDataSource.runMigrations();
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
};
if (require.main === module) {
  resetDb().catch(console.error);
}
