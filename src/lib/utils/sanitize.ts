/**
 * XSS 방지 유틸리티 함수
 * 
 * 사용자 입력을 안전하게 처리하기 위한 sanitization 함수들을 제공합니다.
 */

/**
 * HTML 특수 문자를 이스케이프
 * 
 * 사용자 입력을 HTML로 렌더링할 때 XSS 공격을 방지하기 위해
 * 특수 문자를 HTML 엔티티로 변환합니다.
 * 
 * @param text - 이스케이프할 텍스트
 * @returns 이스케이프된 텍스트
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) {
    return "";
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * HTML 태그 제거
 * 
 * 사용자 입력에서 모든 HTML 태그를 제거합니다.
 * 
 * @param html - HTML 문자열
 * @returns 태그가 제거된 텍스트
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  return html.replace(/<[^>]*>/g, "");
}

/**
 * 안전한 HTML sanitization
 * 
 * 허용된 태그와 속성만 남기고 나머지는 제거합니다.
 * 기본적으로 텍스트만 허용하며, 필요시 특정 태그를 허용할 수 있습니다.
 * 
 * @param html - sanitize할 HTML 문자열
 * @param allowedTags - 허용할 HTML 태그 목록 (선택사항)
 * @returns sanitized HTML
 */
export function sanitizeHtml(
  html: string | null | undefined,
  allowedTags: string[] = []
): string {
  if (!html) {
    return "";
  }

  // 허용된 태그가 없으면 모든 태그 제거
  if (allowedTags.length === 0) {
    return stripHtmlTags(html);
  }

  // 허용된 태그만 남기고 나머지 제거
  const allowedTagsPattern = allowedTags.join("|");
  const regex = new RegExp(
    `<(?!/?(?:${allowedTagsPattern})(?:\s|>))[^>]*>`,
    "gi"
  );

  return html.replace(regex, "");
}

/**
 * URL sanitization
 * 
 * URL에서 위험한 프로토콜을 제거하고 안전한 URL만 허용합니다.
 * 
 * @param url - sanitize할 URL
 * @param allowedProtocols - 허용할 프로토콜 목록 (기본값: ["http", "https"])
 * @returns sanitized URL 또는 빈 문자열
 */
export function sanitizeUrl(
  url: string | null | undefined,
  allowedProtocols: string[] = ["http", "https"]
): string {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.replace(":", "");

    if (!allowedProtocols.includes(protocol.toLowerCase())) {
      return "";
    }

    return parsedUrl.toString();
  } catch {
    // 유효하지 않은 URL인 경우 빈 문자열 반환
    return "";
  }
}

/**
 * JavaScript 코드 제거
 * 
 * 문자열에서 JavaScript 코드 패턴을 제거합니다.
 * 
 * @param text - 검사할 텍스트
 * @returns JavaScript 코드가 제거된 텍스트
 */
export function removeJavaScript(text: string | null | undefined): string {
  if (!text) {
    return "";
  }

  return text
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "") // 이벤트 핸들러 제거 (onclick=, onerror= 등)
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // <script> 태그 제거
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, ""); // <iframe> 태그 제거
}

/**
 * 사용자 입력 전체 sanitization
 * 
 * 여러 sanitization 함수를 조합하여 사용자 입력을 안전하게 처리합니다.
 * 
 * @param input - sanitize할 입력값
 * @param options - sanitization 옵션
 * @returns sanitized 입력값
 */
export function sanitizeInput(
  input: string | null | undefined,
  options: {
    escapeHtml?: boolean;
    stripTags?: boolean;
    removeJavaScript?: boolean;
    allowedTags?: string[];
  } = {}
): string {
  if (!input) {
    return "";
  }

  let sanitized = input;

  // JavaScript 제거
  if (options.removeJavaScript !== false) {
    sanitized = removeJavaScript(sanitized);
  }

  // HTML 태그 제거 또는 허용된 태그만 남기기
  if (options.stripTags !== false) {
    sanitized = sanitizeHtml(sanitized, options.allowedTags);
  }

  // HTML 이스케이프
  if (options.escapeHtml === true) {
    sanitized = escapeHtml(sanitized);
  }

  return sanitized;
}

/**
 * JSON 문자열 sanitization
 * 
 * JSON 문자열에서 위험한 패턴을 제거합니다.
 * 
 * @param json - sanitize할 JSON 문자열
 * @returns sanitized JSON 문자열
 */
export function sanitizeJson(json: string | null | undefined): string {
  if (!json) {
    return "";
  }

  // 기본적인 JavaScript 코드 패턴 제거
  return removeJavaScript(json);
}

/**
 * CSS 값 sanitization
 * 
 * CSS 값에서 위험한 표현식을 제거합니다.
 * 
 * @param css - sanitize할 CSS 값
 * @returns sanitized CSS 값
 */
export function sanitizeCss(css: string | null | undefined): string {
  if (!css) {
    return "";
  }

  // expression(), javascript: 등 위험한 CSS 표현식 제거
  return css
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/@import/gi, "")
    .replace(/behavior\s*:/gi, "");
}

