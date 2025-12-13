import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/../database.types";

export const dynamic = "force-dynamic";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

// UUID 형식 검증 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 프롬프트 상세 조회 API
 * GET /api/prompts/[id]
 *
 * 경로 파라미터:
 * - id: 프롬프트 UUID
 *
 * 인증:
 * - 무료 프롬프트: 인증 없이 조회 가능
 * - 유료 프롬프트: 인증 필요 (구독 체크는 향후 구현)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // UUID 형식 검증
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid prompt ID format" },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 프롬프트 조회
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // 프롬프트가 존재하지 않는 경우
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Prompt not found" },
          { status: 404 }
        );
      }

      console.error("Error fetching prompt:", error);
      return NextResponse.json(
        { error: "Failed to fetch prompt" },
        { status: 500 }
      );
    }

    // 프롬프트가 없는 경우 (null 체크)
    if (!data) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const prompt = data as PromptTemplate;

    // 무료 프롬프트는 공개 조회 가능
    if (prompt.is_free) {
      return NextResponse.json({ data: prompt });
    }

    // 유료 프롬프트는 인증 필요
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required for paid prompts" },
        { status: 401 }
      );
    }

    // 유료 프롬프트 반환 (구독 체크는 향후 구현)
    return NextResponse.json({ data: prompt });
  } catch (error) {
    console.error("Error in prompt detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

