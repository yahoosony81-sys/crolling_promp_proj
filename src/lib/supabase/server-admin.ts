/**
 * 서버 사이드 관리자용 Supabase 클라이언트 생성
 * 
 * API 라우트나 서버 사이드에서만 사용 가능한 클라이언트입니다.
 * cookies나 auth 없이 직접 서비스 키를 사용합니다.
 * 
 * 주의: 이 클라이언트는 서버 사이드에서만 사용해야 합니다.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 사이드 관리자용 Supabase 클라이언트 생성
 * @returns Supabase 클라이언트 인스턴스
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

