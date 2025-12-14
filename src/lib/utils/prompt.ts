import type { Json } from "@/../database.types";
import type {
  VariableGuide,
  PromptInputs,
  VariableValidationResult,
} from "@/lib/types/prompt";

/**
 * 프롬프트 관련 유틸리티 함수
 */

/**
 * 프롬프트 본문의 변수를 실제 값으로 치환
 * @param content - 프롬프트 본문 (예: "주제: {topic}")
 * @param inputs - 변수 값 객체 (예: {topic: "겨울 패션"})
 * @returns 치환된 프롬프트 문자열
 * @example
 * replaceVariables("주제: {topic}", {topic: "겨울 패션"})
 * // => "주제: 겨울 패션"
 */
export function replaceVariables(
  content: string,
  inputs: PromptInputs
): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  if (!inputs || typeof inputs !== "object") {
    return content;
  }

  // {variable} 형태의 변수를 찾아서 치환
  return content.replace(/\{(\w+)\}/g, (match, variableName) => {
    const value = inputs[variableName];
    // 값이 제공되지 않으면 원본 변수명 유지
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * 프롬프트 본문에서 변수명 목록 추출
 * @param content - 프롬프트 본문
 * @returns 추출된 변수명 배열 (중복 제거)
 * @example
 * extractVariables("주제: {topic}\n타겟: {target}")
 * // => ["topic", "target"]
 */
export function extractVariables(content: string): string[] {
  if (!content || typeof content !== "string") {
    return [];
  }

  const matches = content.match(/\{(\w+)\}/g);
  if (!matches) {
    return [];
  }

  // 변수명 추출 및 중복 제거
  const variables = matches.map((match) => match.slice(1, -1)); // {topic} -> topic
  return Array.from(new Set(variables));
}

/**
 * 프롬프트에 필요한 변수가 모두 제공되었는지 검증
 * @param content - 프롬프트 본문
 * @param inputs - 제공된 변수 값 객체
 * @returns 검증 결과 (유효성 여부 및 누락된 변수 목록)
 * @example
 * validateVariables("주제: {topic}", {topic: "겨울 패션"})
 * // => { isValid: true, missing: [] }
 * validateVariables("주제: {topic}", {})
 * // => { isValid: false, missing: ["topic"] }
 */
export function validateVariables(
  content: string,
  inputs: PromptInputs
): VariableValidationResult {
  const requiredVariables = extractVariables(content);
  const providedVariables = inputs ? Object.keys(inputs) : [];
  
  const missing = requiredVariables.filter(
    (variable) => !providedVariables.includes(variable)
  );

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * 프롬프트를 읽기 좋게 포맷팅
 * @param content - 프롬프트 본문
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 프롬프트 문자열
 */
export function formatPrompt(
  content: string,
  options?: { indent?: number }
): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  const indent = options?.indent ?? 0;
  if (indent === 0) {
    return content;
  }

  // 각 줄에 들여쓰기 추가
  const indentStr = " ".repeat(indent);
  return content
    .split("\n")
    .map((line) => (line.trim() ? indentStr + line : line))
    .join("\n");
}

/**
 * 데이터베이스의 variables JSONB를 타입 안전한 배열로 변환
 * @param variables - 데이터베이스의 variables JSONB 값
 * @returns 변수 가이드 배열
 */
export function parseVariableGuide(variables: Json): VariableGuide[] {
  if (!variables) {
    return [];
  }

  // 배열인지 확인
  if (!Array.isArray(variables)) {
    return [];
  }

  return variables
    .map((item) => {
      // 객체인지 확인
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      // name 필드가 있는지 확인
      if (typeof item.name !== "string") {
        return null;
      }

      return {
        name: item.name,
        description:
          typeof item.description === "string" ? item.description : undefined,
        example: typeof item.example === "string" ? item.example : undefined,
      };
    })
    .filter((item): item is VariableGuide => item !== null);
}

/**
 * 데이터베이스의 example_inputs JSONB를 객체로 변환
 * @param exampleInputs - 데이터베이스의 example_inputs JSONB 값
 * @returns 변수 입력값 객체
 */
export function parseExampleInputs(exampleInputs: Json): PromptInputs {
  if (!exampleInputs) {
    return {};
  }

  // 객체인지 확인
  if (
    typeof exampleInputs !== "object" ||
    exampleInputs === null ||
    Array.isArray(exampleInputs)
  ) {
    return {};
  }

  // 모든 값을 문자열로 변환
  const result: PromptInputs = {};
  for (const [key, value] of Object.entries(exampleInputs)) {
    if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  }

  return result;
}

/**
 * 프롬프트 템플릿에서 변수 치환된 프롬프트 생성
 * @param content - 프롬프트 본문
 * @param exampleInputs - 예시 입력값 (JSONB)
 * @param customInputs - 사용자 정의 입력값 (선택적, exampleInputs를 덮어씀)
 * @returns 치환된 프롬프트 문자열
 */
export function createPromptWithVariables(
  content: string,
  exampleInputs: Json,
  customInputs?: PromptInputs
): string {
  const parsedInputs = parseExampleInputs(exampleInputs);
  
  // 사용자 정의 입력값이 있으면 병합 (customInputs가 우선)
  const finalInputs = customInputs
    ? { ...parsedInputs, ...customInputs }
    : parsedInputs;

  return replaceVariables(content, finalInputs);
}

