import { db } from "@/db";
import { attachments } from "@/db/schema";
import { eq, and, desc, count, SQL } from "drizzle-orm";
import { AppError } from "@/lib/error-handler";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export interface ListAttachmentsFilters {
  leadId?: string;
  customerId?: string;
  taskId?: string;
  page?: number;
  limit?: number;
}

export async function listAttachments(userId: string, filters: ListAttachmentsFilters) {
  const { leadId, customerId, taskId, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(attachments.userId, userId)];

  if (leadId) conditions.push(eq(attachments.leadId, leadId));
  if (customerId) conditions.push(eq(attachments.customerId, customerId));
  if (taskId) conditions.push(eq(attachments.taskId, taskId));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.attachments.findMany({
      where,
      limit,
      offset,
      orderBy: desc(attachments.createdAt),
      with: { owner: true },
    }),
    db.select({ count: count() }).from(attachments).where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  // Generate presigned download URLs
  const dataWithUrls = await Promise.all(
    data.map(async (attachment) => {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: attachment.r2Key,
      });
      const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      return { ...attachment, downloadUrl };
    }),
  );

  return {
    data: dataWithUrls,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createPresignedUploadUrl(
  userId: string,
  input: {
    filename: string;
    contentType: string;
    leadId?: string;
    customerId?: string;
    taskId?: string;
  },
) {
  const r2Key = `${userId}/${uuidv4()}-${input.filename}`;

  const [attachment] = await db
    .insert(attachments)
    .values({
      userId,
      leadId: input.leadId || null,
      customerId: input.customerId || null,
      taskId: input.taskId || null,
      filename: input.filename,
      r2Key,
      contentType: input.contentType,
      size: 0,
    })
    .returning();

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

  return { attachment, uploadUrl };
}

export async function confirmAttachmentUpload(
  userId: string,
  attachmentId: string,
  size: number,
) {
  const [updated] = await db
    .update(attachments)
    .set({ size })
    .where(and(eq(attachments.id, attachmentId), eq(attachments.userId, userId)))
    .returning();

  if (!updated) throw new AppError("Attachment not found", 404);
  return updated;
}

export async function deleteAttachment(userId: string, attachmentId: string) {
  const attachment = await db.query.attachments.findFirst({
    where: and(eq(attachments.id, attachmentId), eq(attachments.userId, userId)),
  });

  if (!attachment) throw new AppError("Attachment not found", 404);

  // Delete from R2
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: attachment.r2Key,
    }),
  );

  // Delete from DB
  await db
    .delete(attachments)
    .where(and(eq(attachments.id, attachmentId), eq(attachments.userId, userId)));
}
