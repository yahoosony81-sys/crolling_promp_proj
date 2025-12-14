import { z } from "zod";

/**
 * 구독 관련 Zod 스키마
 */

// 구독 상태 값
export const SubscriptionStatusSchema = z.enum([
  "active",
  "past_due",
  "canceled",
]);

// 구독 플랜 이름
export const SubscriptionPlanNameSchema = z.enum(["monthly_9900"]);

// 구독 생성 요청 스키마 (현재는 본문이 없지만 향후 확장 가능)
export const CreateSubscriptionSchema = z.object({}).strict();

// 구독 취소 요청 스키마 (현재는 본문이 없지만 향후 확장 가능)
export const CancelSubscriptionSchema = z.object({}).strict();

// 구독 갱신 요청 스키마 (현재는 본문이 없지만 향후 확장 가능)
export const RenewSubscriptionSchema = z.object({}).strict();

// 결제 내역 조회 쿼리 파라미터 스키마
export const GetPaymentHistoryQuerySchema = z.object({
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

// 이용 기록 조회 쿼리 파라미터 스키마
export const GetUsageHistoryQuerySchema = z.object({
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

