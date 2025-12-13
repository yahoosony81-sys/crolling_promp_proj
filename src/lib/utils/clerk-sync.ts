import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { ClerkWebhookEventData } from "@/lib/types/webhook";

/**
 * Clerk → Supabase 사용자 동기화 유틸리티 함수
 * 
 * Clerk 웹훅을 통해 받은 사용자 정보를 Supabase에 동기화합니다.
 */

/**
 * Supabase Admin 클라이언트 생성
 * 
 * Service Role Key를 사용하여 관리자 권한으로 Supabase에 접근합니다.
 * 
 * @returns Supabase Admin 클라이언트
 */
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Clerk 사용자 ID를 UUID로 변환
 * 
 * Supabase auth.users 테이블의 id는 UUID 형식이어야 합니다.
 * Clerk user ID는 문자열이므로 UUID로 변환합니다.
 * 
 * @param clerkUserId - Clerk 사용자 ID
 * @returns UUID 형식의 문자열
 */
function clerkUserIdToUUID(clerkUserId: string): string {
  // Clerk user ID를 UUID 형식으로 변환
  // 간단한 해시 기반 변환 (일관성 유지)
  const hash = crypto.createHash("sha256").update(clerkUserId).digest();
  
  // UUID v4 형식으로 변환 (16바이트 사용)
  const uuid = [
    hash.slice(0, 4).toString("hex"),
    hash.slice(4, 6).toString("hex"),
    ((hash[6] & 0x0f) | 0x40).toString(16) + hash.slice(7, 8).toString("hex"),
    ((hash[8] & 0x3f) | 0x80).toString(16) + hash.slice(9, 10).toString("hex"),
    hash.slice(10, 16).toString("hex"),
  ].join("-");

  return uuid;
}

/**
 * Clerk 사용자를 Supabase에 생성
 * 
 * @param userData - Clerk 웹훅 이벤트 데이터
 * @returns 생성된 사용자 ID 또는 null
 */
export async function syncClerkUserToSupabase(
  userData: ClerkWebhookEventData
): Promise<string | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const userId = clerkUserIdToUUID(userData.id);

    // 이미 존재하는지 확인
    const { data: existingUser } = await supabase.auth.admin.getUserById(
      userId
    );

    if (existingUser?.user) {
      console.log(`User already exists in Supabase: ${userId}`);
      return userId;
    }

    // Supabase에 사용자 생성
    // Clerk user ID를 email로 사용 (Supabase는 email이 필요함)
    const email =
      userData.primary_email_address?.email_address ||
      `${userData.id}@clerk.local`;

    const { data, error } = await supabase.auth.admin.createUser({
      id: userId,
      email: email,
      email_confirm: true, // Clerk에서 이미 인증됨
      user_metadata: {
        clerk_user_id: userData.id,
        clerk_username: userData.username,
        clerk_first_name: userData.first_name,
        clerk_last_name: userData.last_name,
        clerk_image_url: userData.image_url,
      },
    });

    if (error) {
      console.error("Error creating user in Supabase:", error);
      return null;
    }

    console.log(`User created in Supabase: ${userId}`);
    return userId;
  } catch (error) {
    console.error("Error syncing Clerk user to Supabase:", error);
    return null;
  }
}

/**
 * Clerk 사용자 정보를 Supabase에서 업데이트
 * 
 * @param userData - Clerk 웹훅 이벤트 데이터
 * @returns 업데이트 성공 여부
 */
export async function updateClerkUserInSupabase(
  userData: ClerkWebhookEventData
): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const userId = clerkUserIdToUUID(userData.id);

    const email =
      userData.primary_email_address?.email_address ||
      `${userData.id}@clerk.local`;

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email: email,
      user_metadata: {
        clerk_user_id: userData.id,
        clerk_username: userData.username,
        clerk_first_name: userData.first_name,
        clerk_last_name: userData.last_name,
        clerk_image_url: userData.image_url,
      },
    });

    if (error) {
      console.error("Error updating user in Supabase:", error);
      return false;
    }

    console.log(`User updated in Supabase: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error updating Clerk user in Supabase:", error);
    return false;
  }
}

/**
 * Clerk 사용자를 Supabase에서 삭제
 * 
 * @param clerkUserId - Clerk 사용자 ID
 * @returns 삭제 성공 여부
 */
export async function deleteClerkUserFromSupabase(
  clerkUserId: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const userId = clerkUserIdToUUID(clerkUserId);

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user from Supabase:", error);
      return false;
    }

    console.log(`User deleted from Supabase: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error deleting Clerk user from Supabase:", error);
    return false;
  }
}
