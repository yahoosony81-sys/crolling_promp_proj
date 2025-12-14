import type { Json } from "@/../database.types";

/**
 * 프롬프트 변수 가이드 타입
 */
export interface VariableGuide {
  name: string;
  description?: string;
  example?: string;
}

/**
 * 프롬프트 입력값 타입
 */
export type PromptInputs = Record<string, string>;

/**
 * 변수 검증 결과 타입
 */
export interface VariableValidationResult {
  isValid: boolean;
  missing: string[];
}

