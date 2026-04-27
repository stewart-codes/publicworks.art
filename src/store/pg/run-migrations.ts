import { AppDataSource } from "./data-source";

export const runMigrations = async (): Promise<void> => {
  await AppDataSource.initialize();
  try {
    await AppDataSource.runMigrations();
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
};
if (require.main === module) {
  runMigrations().catch(console.error);
}
