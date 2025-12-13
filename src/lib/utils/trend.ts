/**
 * 트렌드 관련 유틸리티 함수
 */

/**
 * ISO week 형식으로 week_key 생성
 * @param date - 기준 날짜 (기본값: 현재 날짜)
 * @returns week_key 문자열 (예: "2025-W50")
 */
export function generateWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

/**
 * 현재 주차의 week_key 반환
 * @returns 현재 주차의 week_key
 */
export function getCurrentWeekKey(): string {
  return generateWeekKey();
}

/**
 * 특정 날짜의 week_key 반환
 * @param date - 날짜 객체
 * @returns 해당 날짜의 week_key
 */
export function getWeekKeyFromDate(date: Date): string {
  return generateWeekKey(date);
}

