import { z } from "zod";

/**
 * 트렌드 관련 Zod 스키마
 */

// 트렌드 카테고리 값
export const TrendCategorySchema = z.enum([
  "product",
  "real_estate",
  "stock",
  "blog",
  "shorts",
  "reels",
]);

// 주차 키 형식 (예: "2025-W50")
export const WeekKeySchema = z.string().regex(
  /^\d{4}-W\d{2}$/,
  "Invalid week key format (expected: YYYY-W##)"
);

// 트렌드 패키지 목록 조회 쿼리 파라미터 스키마
export const GetTrendsQuerySchema = z.object({
  category: TrendCategorySchema.optional(),
  week_key: WeekKeySchema.optional(),
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

// 트렌드 패키지 상세 조회 경로 파라미터 스키마
export const GetTrendParamsSchema = z.object({
  id: z.string().uuid("Invalid trend pack ID format"),
});

// 스크랩 아이템 목록 조회 쿼리 파라미터 스키마
export const GetScrapedItemsQuerySchema = z.object({
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

