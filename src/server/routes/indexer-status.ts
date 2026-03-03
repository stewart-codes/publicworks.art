import { z } from "zod";
import { stores } from "../../store/stores";
import { baseProcedure, t } from "../trpc";

const getLastSweptBlock = baseProcedure
  .input(z.object({}).nullish())

  .query(async ({ input, ctx }) => {
    const lastSweptBlock = await stores().indexer.getLastSweptHeight();
    const lastSweptBlockHeight = parseInt(
      lastSweptBlock.height.toString() || "0"
    );
    return {
      diff: null,
      lastSweptBlock: {
        height: lastSweptBlockHeight,
        timestamp: lastSweptBlock.updatedAt.toISOString(),
      },
      latestBlockHeight: null,
    };
  });

export const indexerRouter = t.router({
  // Public
  getLastSweptBlock: getLastSweptBlock,
});
