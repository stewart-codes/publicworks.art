import {
  serializeWork,
  serializeWorkToken,
  serializeWorkTokenFull,
} from "../../db-typeorm/serializable/works/serialize-work";
import { dataUrlToBuffer } from "../../base64/dataurl";
import {
  deleteCid,
  getMetadataWorkId,
  uploadFileToPinata,
} from "../../ipfs/pinata";
import { CreateProjectRequestZ, editProjectZod } from "../../store";
import { stores } from "../../store/stores";
import { normalizeMetadataUri } from "../../wasm/metadata";
import { authorizedProcedure, baseProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";
import mime from "mime-types";
import {
  confirmCoverImageUpload,
  confirmUpload,
} from "src/upload/confirm-upload";
import { createPresignedUrl } from "src/upload/presignedUrl";
import { zodStarsAddress } from "src/wasm/address";
import { z } from "zod";

const createWork = authorizedProcedure
  .input(CreateProjectRequestZ)
  .mutation(async ({ input, ctx }) => {
    // do something in firebase
    const user = ctx?.user;
    if (!user) {
      return null;
    }
    const project = await stores().project.createProject(user, input);
    if (!project.ok) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
    return serializeWork(project.value);
  });
const editWork = authorizedProcedure
  .input(editProjectZod.omit({ sg721: true, minter: true }))

  .mutation(async ({ input, ctx }) => {
    const user = ctx?.user;
    if (!user) {
      return null;
    }
    const work = await stores().project.getProject(input.id);
    if (!work || work.owner.id !== user.id) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const startDate = input.startDate
      ? new Date(input.startDate)
      : (work.startDate ?? new Date(0));
    const project = await stores().project.updateProject(input.id, {
      ...input,
      hidden: input.hidden === undefined ? work.hidden : input.hidden,
      startDate: startDate.toISOString(),
    });
    if (!project.ok) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
    return serializeWork(project.value);
  });
const editWorkContracts = authorizedProcedure
  .input(
    z.object({
      id: z.number(),
      sg721: z.string(),
      minter: z.string(),
    })
  )

  .mutation(async ({ input, ctx }) => {
    const user = ctx?.user;
    if (!user) {
      return null;
    }
    const work = await stores().project.getProject(input.id);
    if (!work || work.owner.id !== user.id) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const sg721CodeId = 0;
    const minterCodeId = 0;

    if (
      sg721CodeId === work.sg721CodeId &&
      minterCodeId === work.minterCodeId &&
      input.sg721 === work.sg721 &&
      input.minter === work.minter
    ) {
      console.log("no change to contracts");
      return serializeWork(work);
    }
    const project = await stores().project.updateProject(input.id, {
      ...input,
      hidden: work.hidden,
      sg721CodeId,
      minterCodeId,
      startDate: (work.startDate || new Date(0)).toISOString(),
    });
    if (!project.ok) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
    //delete work tokens too in the case that the work was already minted then stop
    //todo stew
    // const deleteRes = await stores().project.deleteWorkTokens(input.id);
    // console.log("deleted existing work tokens", deleteRes);
    return serializeWork(project.value);
  });
const getWorkById = baseProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )

  .query(async ({ input, ctx }) => {
    const project = await stores().project.getProject(input.id);

    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return serializeWork(project);
  });
const getWorkBySlug = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    })
  )

  .query(async ({ input, ctx }) => {
    const project = await stores().project.getProjectBySlug(input.slug);

    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    return serializeWork(project);
  });

const getWorkTokenByTokenId = baseProcedure
  .input(
    z.object({
      workId: z.number(),
      tokenId: z.number().int().positive(),
    })
  )

  .query(async ({ input, ctx }) => {
    const token = await stores().project.getToken({
      workId: input.workId,
      tokenId: input.tokenId.toString(),
    });

    if (!token) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    return serializeWorkToken(token);
  });

const listWorks = baseProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().nullish(),
      publishedState: z
        .string()
        .optional()
        .default("PUBLISHED")
        .refine((val) => {
          return ["PUBLISHED", "UNPUBLISHED", "ALL"].includes(val);
        }),
      address: zodStarsAddress.optional(),
      order: z
        .string()
        .default("asc")
        .refine((val) => {
          return ["desc", "asc"].includes(val);
        }, "sort must be asc or desc"),
      includeHidden: z.boolean(),
    })
  )

  .query(async ({ input, ctx }) => {
    let order: "asc" | "desc" = "asc";
    if (input.order === "desc") {
      order = "desc";
    }
    const { items, nextOffset: nextCursor } =
      await stores().project.getProjects({
        ...input,
        order,
        offset: input.cursor || undefined,
      });

    return {
      items: items
        .filter(
          (w) => w.slug !== "stones" && w.slug !== "wildflowers-in-the-wind"
        )
        .map(serializeWork),
      nextCursor,
    };
  });

const listAddressWorks = baseProcedure
  .input(
    z.object({
      address: zodStarsAddress,
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().nullish(),
      publishedState: z
        .string()
        .optional()
        .default("PUBLISHED")
        .refine((val) => {
          return ["PUBLISHED", "UNPUBLISHED", "ALL"].includes(val);
        }),
      direction: z.string().default("DESC"),
    })
  )

  .query(async ({ input, ctx }) => {
    let direction: "DESC" | "ASC" = "DESC";
    if (input.direction === "ASC") {
      direction = "ASC";
    }
    const { items, nextOffset: nextCursor } =
      await stores().project.getAccountProjects({
        ...input,
        direction,
        offset: input.cursor || undefined,
      });

    return { items: items.map(serializeWork), nextCursor };
  });

const workPreviewImg = baseProcedure
  .input(
    z.object({
      workId: z.number(),
    })
  )

  .query(async ({ input, ctx }) => {
    const project = await stores().project.getProject(input.workId);
    if (project?.coverImageCid) {
      return normalizeMetadataUri("ipfs://" + project.coverImageCid);
    }
    const preview = await stores().project.getProjectPreviewImage(
      input.workId.toString()
    );

    if (!preview || !preview.imageUrl) {
      return null;
    }
    return normalizeMetadataUri(preview.imageUrl);
  });
const workTokenCount = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    return stores().project.getTokenCount(input.slug);
  });

const lastMintedToken = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const token = await stores().project.lastMintedToken(input.slug);
    if (!token) {
      return null;
    }
    return serializeWorkToken(token);
  });

const uploadPreviewImg = authorizedProcedure
  .input(
    z.object({
      workId: z.number(),
      coverImageDataUrl: z.string(),
    })
  )

  .mutation(async ({ input, ctx }) => {
    console.log("hello here start");
    const work = await stores().project.getProject(input.workId);
    console.log("got work");
    if (!work || work.owner.id !== ctx.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const { buffer, contentType } = dataUrlToBuffer(input.coverImageDataUrl);
    console.log("contentType", contentType);
    if (work.coverImageCid) {
      console.log("deleting old image cid");
      const existinWorkId = await getMetadataWorkId(work.coverImageCid);
      if (existinWorkId === work.id) {
        //only delete it if the current user owns it.
        await deleteCid(work.coverImageCid);
        console.log("deleted old image cid");
      }
    }
    console.log("uploading");
    const coverImageCid = await uploadFileToPinata(buffer, contentType, {
      workId: work.id,
    });
    console.log("finished uploading");
    const response = await stores().project.updateProject(work.id, {
      coverImageCid,
      hidden: work.hidden,
      startDate: (work.startDate || new Date(0)).toISOString(),
    });
    if (!response.ok) {
      throw response.error;
    }

    return { ok: true };
  });

const uploadWorkGenerateUrl = authorizedProcedure
  .input(
    z.object({
      workId: z.number(),
      contentType: z.string().optional().nullish(),
      contentSize: z.number().min(1).max(20_000_000),
    })
  )

  .mutation(async ({ input, ctx }) => {
    const work = await stores().project.getProject(input.workId);
    if (!work || work.owner.id !== ctx.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { url, filename } = await createPresignedUrl(
      work,
      "application/zip",
      "code",
      input.contentSize
    );
    const obj = await stores().project.saveUploadId(work, filename);

    return { ok: true, url, method: "PUT", uploadId: obj.id };
  });

const confirmWorkUpload = authorizedProcedure
  .input(
    z.object({
      workId: z.number(),
      uploadId: z.string().uuid(),
    })
  )

  .mutation(async ({ input, ctx }) => {
    const work = await stores().project.getProject(input.workId);
    if (!work || work.owner.id !== ctx.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    //it throws
    const confirmed = await confirmUpload(input.uploadId, work);

    return;
  });
const uploadWorkCoverImageGenerateUrl = authorizedProcedure
  .input(
    z.object({
      workId: z.number(),
      contentType: z.string(),
      contentSize: z.number().min(1).max(20_000_000),
    })
  )

  .mutation(async ({ input, ctx }) => {
    const work = await stores().project.getProjectForId(
      input.workId.toString()
    );
    if (!work || work.owner.id !== ctx.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const lookup = mime.contentType(input.contentType);
    if (!lookup) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid content type",
      });
    }

    const { url, filename } = await createPresignedUrl(
      work,
      input.contentType || undefined,
      "cover-image",
      input.contentSize
    );
    const obj = await stores().project.saveUploadId(work, filename);

    return { ok: true, url, method: "PUT", uploadId: obj.id };
  });
const confirmWorkCoverImageUpload = authorizedProcedure
  .input(
    z.object({
      workId: z.number(),
      uploadId: z.string().uuid(),
    })
  )

  .mutation(async ({ input, ctx }) => {
    const work = await stores().project.getProjectForId(
      input.workId.toString()
    );
    if (!work || work.owner.id !== ctx.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    //it throws
    const confirmed = await confirmCoverImageUpload(input.uploadId, work);

    return;
  });
const deleteWork = authorizedProcedure
  .input(
    z.object({
      workId: z.number(),
    })
  )

  .mutation(async ({ input, ctx }) => {
    const work = await stores().project.getProjectForId(
      input.workId.toString()
    );
    if (!work || work.owner.id !== ctx.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (work.sg721) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "cannot delete published worked",
      });
    }
    return stores().project.deleteWork(work);
  });
const tokenStatus = baseProcedure
  .input(
    z.object({
      workId: z.number(),
      cursor: z.string().nullish(),
      take: z.number().int().positive().max(100).default(10),
    })
  )

  .query(async ({ input, ctx }) => {
    const work = await stores().project.getProjectForId(
      input.workId.toString()
    );
    if (!work) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const [{ items, nextOffset }, token] = await Promise.all([
      stores().project.getProjectTokens2({
        workId: input.workId,
        limit: input.take,
        offset: input.cursor ?? undefined,
        publishedState: "PUBLISHED",
      }),
      stores().project.lastMintedToken(work.slug),
    ]);

    //todo stew the count needs to be removed from the FE
    return {
      items: items.map(serializeWorkTokenFull),
      nextCursor: nextOffset,
      count: token?.token_id ? parseInt(token.token_id) : 0,
    };
  });

export const workRouter = t.router({
  // Public
  createWork: createWork,
  editWork: editWork,
  editWorkContracts,
  getWorkById: getWorkById,
  getWorkBySlug,
  getWorkTokenByTokenId: getWorkTokenByTokenId,
  listWorks: listWorks,
  workPreviewImg: workPreviewImg,
  uploadPreviewImg: uploadPreviewImg,
  listAddressWorks: listAddressWorks,
  workTokenCount: workTokenCount,
  lastMintedToken: lastMintedToken,
  uploadWorkGenerateUrl: uploadWorkGenerateUrl,
  uploadWorkCoverImageGenerateUrl: uploadWorkCoverImageGenerateUrl,
  confirmWorkUpload: confirmWorkUpload,
  confirmWorkCoverImageUpload: confirmWorkCoverImageUpload,
  deleteWork: deleteWork,
  tokenStatus: tokenStatus,
});
