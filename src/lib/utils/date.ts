import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜 포맷팅 유틸리티 함수
 * date-fns를 활용하여 한국어 날짜 포맷팅 제공
 */

/**
 * 한국어 형식으로 날짜 포맷팅
 * @param date - 포맷팅할 날짜
 * @param formatStr - 포맷 문자열 (date-fns format 형식)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date | string, formatStr: string = "yyyy년 MM월 dd일"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

/**
 * 날짜와 시간을 함께 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns "YYYY년 MM월 DD일 HH:mm" 형식의 문자열
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, "yyyy년 MM월 dd일 HH:mm");
}

/**
 * 상대 시간 표시 (예: "3일 전", "2시간 전")
 * @param date - 기준 날짜
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
}

/**
 * 날짜가 과거인지 확인
 * @param date - 확인할 날짜
 * @returns 과거 여부
 */
export function isDatePast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return isPast(dateObj);
}

/**
 * 날짜가 미래인지 확인
 * @param date - 확인할 날짜
 * @returns 미래 여부
 */
export function isDateFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return isFuture(dateObj);
}

/**
 * 구독 기간 표시용 날짜 포맷팅
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns "YYYY년 MM월 DD일 ~ YYYY년 MM월 DD일" 형식의 문자열
 */
export function formatSubscriptionPeriod(
  startDate: Date | string,
  endDate: Date | string
): string {
  const start = formatDate(startDate, "yyyy년 MM월 dd일");
  const end = formatDate(endDate, "yyyy년 MM월 dd일");
  return `${start} ~ ${end}`;
}

