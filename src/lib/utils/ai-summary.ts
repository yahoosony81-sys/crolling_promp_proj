/**
 * AI 요약 유틸리티 함수
 */

/**
 * AI 요약이 필요한지 판단
 * @param content - 원본 텍스트
 * @returns AI 요약 필요 여부
 */
export function shouldUseAISummary(content: string): boolean {
  if (!content) return false;

  const length = content.length;

  // 너무 짧은 텍스트는 AI 요약 불필요
  if (length < 200) {
    return false;
  }

  // 너무 긴 텍스트는 AI 요약 필요
  if (length > 2000) {
    return true;
  }

  // 문단 수가 많으면 AI 요약 필요
  const paragraphs = content.split(/\n\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length > 5) {
    return true;
  }

  // 복잡한 구조 (리스트, 표 등)가 있으면 AI 요약 필요
  const hasComplexStructure =
    content.includes("•") ||
    content.includes("-") ||
    content.includes("1.") ||
    content.includes("2.") ||
    content.match(/\d+\.\s+/g)?.length || 0 > 3;

  return hasComplexStructure;
}

/**
 * OpenAI API를 사용한 텍스트 요약
 * @param content - 원본 텍스트
 * @param maxLength - 최대 요약 길이 (기본값: 300)
 * @returns 요약된 텍스트
 */
export async function summarizeWithAI(
  content: string,
  maxLength: number = 300
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set, skipping AI summary");
    return content.substring(0, maxLength) + "...";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `당신은 전문 요약 전문가입니다. 주어진 텍스트를 ${maxLength}자 이내로 핵심 내용만 간결하게 요약해주세요.`,
          },
          {
            role: "user",
            content: `다음 텍스트를 요약해주세요:\n\n${content.substring(0, 4000)}`, // 토큰 제한 고려
          },
        ],
        max_tokens: Math.floor(maxLength / 2), // 대략적인 토큰 수
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary returned from OpenAI API");
    }

    return summary;
  } catch (error) {
    console.error("Error summarizing with AI:", error);
    // AI 요약 실패 시 기본 요약 반환
    return content.substring(0, maxLength) + "...";
  }
}

/**
 * 하이브리드 요약 (간단한 추출 + 필요시 AI 요약)
 * @param content - 원본 텍스트
 * @param maxLength - 최대 요약 길이 (기본값: 300)
 * @param forceAI - 강제로 AI 요약 사용 여부
 * @returns 요약된 텍스트
 */
export async function summarizeHybrid(
  content: string,
  maxLength: number = 300,
  forceAI: boolean = false
): Promise<string> {
  // AI 요약이 필요한지 판단
  const needsAI = forceAI || shouldUseAISummary(content);

  if (needsAI && process.env.OPENAI_API_KEY) {
    try {
      return await summarizeWithAI(content, maxLength);
    } catch (error) {
      console.warn("AI summary failed, falling back to simple extraction:", error);
      // AI 요약 실패 시 기본 요약으로 폴백
    }
  }

  // 간단한 텍스트 추출 요약
  const { extractSummary } = await import("./crawler");
  return extractSummary(content, maxLength);
}

