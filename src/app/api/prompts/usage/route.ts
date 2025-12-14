import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt_id, pack_id, action } = body;

    // 필수 필드 검증
    if (!prompt_id || !action) {
      return NextResponse.json(
        { error: "prompt_id and action are required" },
        { status: 400 }
      );
    }

    // action 값 검증
    if (!["copy", "view", "run"].includes(action)) {
      return NextResponse.json(
        { error: "action must be one of: copy, view, run" },
        { status: 400 }
      );
    }

    // Clerk 인증 확인 (선택사항 - 로그인하지 않은 사용자는 기록하지 않음)
    const { userId } = await auth();
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
      return NextResponse.json(
        { error: "Failed to save usage record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    console.error("Error in usage API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


