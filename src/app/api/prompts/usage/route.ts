import { NextResponse } from "next/server";
import { optionalAuth } from "@/lib/middleware/auth";
import { createClient } from "@/lib/supabase/server";
import { CreatePromptUsageSchema } from "@/lib/schemas/prompts";
import { withErrorHandler, validationError, internalError } from "@/lib/utils/api-error";

export const dynamic = "force-dynamic";

async function POSTHandler(request: Request) {
  // 요청 본문 파싱 및 검증
  const body = await request.json();
  const validationResult = CreatePromptUsageSchema.safeParse(body);

  if (!validationResult.success) {
    return validationError("Invalid request body", validationResult.error.issues);
  }

  const { prompt_id, pack_id, action } = validationResult.data;

  // Clerk 인증 확인 (선택사항 - 로그인하지 않은 사용자는 기록하지 않음)
  const { userId } = await optionalAuth();
  if (!userId) {
    // 로그인하지 않은 사용자는 성공 응답만 반환 (기록하지 않음)
    return NextResponse.json({ success: true, logged: false });
  }

  // Supabase 클라이언트 생성
  const supabase = await createClient();

  // 사용 기록 저장
  const { error } = await supabase.from("prompt_usages").insert({
    user_id: userId,
    prompt_id,
    pack_id: pack_id || null,
    action,
  });

  if (error) {
    console.error("Error saving prompt usage:", error);
    return internalError("Failed to save usage record");
  }

  return NextResponse.json({ success: true, logged: true });
}

export const POST = withErrorHandler(POSTHandler);


