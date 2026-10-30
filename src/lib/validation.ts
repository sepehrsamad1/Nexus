import { z } from 'zod';

export const roleSchema = z.enum(['USER', 'STREAMER', 'EXPERT', 'ADMIN'] as const);
export type Role = z.infer<typeof roleSchema>;

export const idSchema = z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/, 'Invalid identifier');

export const safeText = (max: number) => z.string().trim().min(1).max(max);

const moderatedText = (max: number) => safeText(max).refine(
  value => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value),
  'Content contains unsupported control characters',
);

export const optionalUrl = z.string().trim().url().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}, 'Invalid URL').nullable().optional();

export const reviewInputSchema = z.object({
  gameId: idSchema,
  score: z.coerce.number().int().min(0).max(100),
  title: safeText(120),
  content: safeText(10000),
  videoUrl: optionalUrl,
  pros: z.array(safeText(200)).max(10),
  cons: z.array(safeText(200)).max(10),
});

export const commentInputSchema = z.object({
  reviewId: idSchema.nullable().optional(),
  gameId: idSchema.nullable().optional(),
  parentId: idSchema.nullable().optional(),
  content: moderatedText(5000),
}).superRefine((value, ctx) => {
  if (!value.reviewId && !value.gameId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A review or game target is required' });
  if (value.reviewId && value.gameId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Use either reviewId or gameId, not both' });
});

export const voteInputSchema = z.object({
  targetId: idSchema,
  type: z.enum(['REVIEW', 'COMMENT']),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export const cartItemTypeSchema = z.enum(['DIGITAL_KEY', 'PHYSICAL_GEAR']);

export const checkoutItemSchema = z.object({
  id: idSchema,
  type: cartItemTypeSchema,
  quantity: z.number().int().min(1).max(99),
}).strict();

export const checkoutPayloadSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(100),
}).strict();

export const paymentSimulationSchema = z.object({
  outcome: z.enum(['SUCCESS', 'FAILURE']),
}).strict();
