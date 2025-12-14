import { z } from "zod";

/**
 * 프롬프트 관련 Zod 스키마
 */

// 카테고리 값
export const PromptCategorySchema = z.enum([
  "blog",
  "shorts",
  "reels",
  "product",
  "real_estate",
  "stock",
  "trend",
]);

// 프롬프트 목록 조회 쿼리 파라미터 스키마
export const GetPromptsQuerySchema = z.object({
  category: PromptCategorySchema.optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

// 프롬프트 상세 조회 경로 파라미터 스키마
export const GetPromptParamsSchema = z.object({
  id: z.string().uuid("Invalid prompt ID format"),
});

// 프롬프트 사용 기록 생성 요청 스키마
export const CreatePromptUsageSchema = z.object({
  prompt_id: z.string().uuid("Invalid prompt ID format"),
  pack_id: z.string().uuid("Invalid pack ID format").optional(),
  action: z.enum(["copy", "view", "run"]),
});

