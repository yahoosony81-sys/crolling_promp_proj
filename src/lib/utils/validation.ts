/**
 * 입력 검증 유틸리티 함수
 * 
 * API 라우트에서 사용자 입력을 검증하기 위한 유틸리티 함수들을 제공합니다.
 */

// UUID 형식 검증 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 이메일 형식 검증 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL 형식 검증 정규식
const URL_REGEX =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * UUID 형식 검증
 * 
 * @param value - 검증할 값
 * @returns 유효한 UUID인지 여부
 */
export function validateUUID(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return UUID_REGEX.test(value);
}

/**
 * 이메일 형식 검증
 * 
 * @param value - 검증할 값
 * @returns 유효한 이메일인지 여부
 */
export function validateEmail(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return EMAIL_REGEX.test(value);
}

/**
 * URL 형식 검증
 * 
 * @param value - 검증할 값
 * @returns 유효한 URL인지 여부
 */
export function validateURL(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return URL_REGEX.test(value);
}

/**
 * 문자열 길이 검증
 * 
 * @param value - 검증할 값
 * @param min - 최소 길이 (선택사항)
 * @param max - 최대 길이 (선택사항)
 * @returns 유효한 길이인지 여부
 */
export function validateLength(
  value: string | null | undefined,
  min?: number,
  max?: number
): boolean {
  if (!value) {
    return min === undefined || min === 0;
  }

  const length = value.length;

  if (min !== undefined && length < min) {
    return false;
  }

  if (max !== undefined && length > max) {
    return false;
  }

  return true;
}

/**
 * 숫자 범위 검증
 * 
 * @param value - 검증할 값
 * @param min - 최소값 (선택사항)
 * @param max - 최대값 (선택사항)
 * @returns 유효한 범위인지 여부
 */
export function validateNumberRange(
  value: number | null | undefined,
  min?: number,
  max?: number
): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

/**
 * 카테고리 값 검증
 * 
 * @param value - 검증할 값
 * @param validCategories - 유효한 카테고리 목록
 * @returns 유효한 카테고리인지 여부
 */
export function validateCategory<T extends string>(
  value: string | null | undefined,
  validCategories: readonly T[]
): value is T {
  if (!value) {
    return false;
  }
  return validCategories.includes(value as T);
}

/**
 * 문자열이 비어있지 않은지 검증
 * 
 * @param value - 검증할 값
 * @returns 비어있지 않은지 여부
 */
export function validateNotEmpty(
  value: string | null | undefined
): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * 배열 길이 검증
 * 
 * @param value - 검증할 배열
 * @param min - 최소 길이 (선택사항)
 * @param max - 최대 길이 (선택사항)
 * @returns 유효한 길이인지 여부
 */
export function validateArrayLength<T>(
  value: T[] | null | undefined,
  min?: number,
  max?: number
): boolean {
  if (!value) {
    return min === undefined || min === 0;
  }

  const length = value.length;

  if (min !== undefined && length < min) {
    return false;
  }

  if (max !== undefined && length > max) {
    return false;
  }

  return true;
}

/**
 * SQL 인젝션 방지를 위한 문자열 sanitization
 * 
 * 주의: 이 함수는 기본적인 SQL 인젝션 방지만 제공합니다.
 * Supabase는 자동으로 파라미터화된 쿼리를 사용하므로 추가 보호가 필요하지 않지만,
 * 사용자 입력을 직접 SQL에 삽입하는 경우를 대비한 함수입니다.
 * 
 * @param value - sanitize할 값
 * @returns sanitized 값
 */
export function sanitizeSQL(value: string): string {
  // SQL 특수 문자 이스케이프
  return value
    .replace(/'/g, "''") // 작은따옴표 이스케이프
    .replace(/;/g, "") // 세미콜론 제거
    .replace(/--/g, "") // SQL 주석 제거
    .replace(/\/\*/g, "") // SQL 주석 시작 제거
    .replace(/\*\//g, ""); // SQL 주석 끝 제거
}

/**
 * 문자열에서 위험한 문자 제거
 * 
 * @param value - sanitize할 값
 * @returns sanitized 값
 */
export function sanitizeString(value: string): string {
  // 제어 문자 및 위험한 문자 제거
  return value
    .replace(/[\x00-\x1F\x7F]/g, "") // 제어 문자 제거
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // 보이지 않는 문자 제거
}

/**
 * 숫자 파싱 및 검증
 * 
 * @param value - 파싱할 값
 * @param min - 최소값 (선택사항)
 * @param max - 최대값 (선택사항)
 * @returns 파싱된 숫자 또는 null
 */
export function parseAndValidateNumber(
  value: string | null | undefined,
  min?: number,
  max?: number
): number | null {
  if (!value) {
    return null;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return null;
  }

  if (!validateNumberRange(parsed, min, max)) {
    return null;
  }

  return parsed;
}

/**
 * 불리언 파싱 및 검증
 * 
 * @param value - 파싱할 값
 * @returns 파싱된 불리언 또는 null
 */
export function parseAndValidateBoolean(
  value: string | null | undefined
): boolean | null {
  if (!value) {
    return null;
  }

  const lower = value.toLowerCase().trim();

  if (lower === "true" || lower === "1" || lower === "yes") {
    return true;
  }

  if (lower === "false" || lower === "0" || lower === "no") {
    return false;
  }

  return null;
}

/**
 * 날짜 파싱 및 검증
 * 
 * @param value - 파싱할 값 (ISO 8601 형식)
 * @returns 파싱된 Date 객체 또는 null
 */
export function parseAndValidateDate(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

