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

/**
 * 텍스트에서 트렌드 키워드 추출
 * @param text - 분석할 텍스트
 * @param options - 추출 옵션
 * @returns 추출된 키워드 배열 (빈도수 기준 정렬)
 * @example
 * extractTrendKeywords("겨울 패션 트렌드가 인기를 끌고 있습니다. 겨울 패션은 올해 더욱 다양해졌습니다.")
 * // => ["겨울 패션", "트렌드"]
 */
export function extractTrendKeywords(
  text: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    maxKeywords?: number;
    stopWords?: string[];
  }
): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const {
    minLength = 2,
    maxLength = 10,
    maxKeywords = 10,
    stopWords: customStopWords = [],
  } = options || {};

  // 기본 불용어 목록
  const defaultStopWords = [
    "것이",
    "것을",
    "것으로",
    "것이다",
    "것입니다",
    "그리고",
    "그런데",
    "그러나",
    "이것",
    "저것",
    "그것",
    "이런",
    "저런",
    "그런",
    "이번",
    "저번",
    "그때",
    "오늘",
    "어제",
    "내일",
    "지금",
    "여기",
    "저기",
    "거기",
    "있습니다",
    "있었다",
    "있을",
    "없습니다",
    "없었다",
    "없을",
    "합니다",
    "했습니다",
    "할",
    "됩니다",
    "되었습니다",
    "될",
  ];

  const allStopWords = [...defaultStopWords, ...customStopWords].map((w) =>
    w.toLowerCase()
  );

  // 한글 단어 패턴 추출 (2-10자)
  const keywordPattern = /[가-힣]{2,10}/g;
  const matches = text.match(keywordPattern) || [];

  // 빈도수 계산
  const frequency: Record<string, number> = {};
  matches.forEach((word) => {
    const lowerWord = word.toLowerCase();
    // 불용어 필터링 및 길이 체크
    if (
      !allStopWords.includes(lowerWord) &&
      word.length >= minLength &&
      word.length <= maxLength
    ) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  // 빈도수 기준 정렬 및 상위 키워드 추출
  const sortedKeywords = Object.entries(frequency)
    .sort((a, b) => {
      // 빈도수가 같으면 길이 순 (짧은 것 우선)
      if (b[1] === a[1]) {
        return a[0].length - b[0].length;
      }
      return b[1] - a[1];
    })
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sortedKeywords;
}

/**
 * 여러 텍스트에서 트렌드 키워드 통합 추출
 * @param texts - 분석할 텍스트 배열
 * @param options - 추출 옵션
 * @returns 추출된 키워드 배열 (통합 빈도수 기준 정렬)
 */
export function extractTrendKeywordsFromMultiple(
  texts: string[],
  options?: {
    minLength?: number;
    maxLength?: number;
    maxKeywords?: number;
    stopWords?: string[];
  }
): string[] {
  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  // 모든 텍스트를 하나로 합치기
  const combinedText = texts.join(" ");

  return extractTrendKeywords(combinedText, options);
}

