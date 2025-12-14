import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/lib/types/database";

/**
 * Clerk와 Supabase를 통합한 서버 사이드 Supabase 클라이언트 생성
 * 
 * Supabase 공식 문서의 모범 사례를 따르며, Clerk 세션 토큰을 자동으로 포함시킵니다.
 * Next.js App Router의 Server Components와 Server Actions에서 사용할 수 있습니다.
 * 
 * @example
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 * 
 * export default async function ServerComponent() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('tasks').select()
 *   return <div>...</div>
 * }
 * ```
 * 
 * @returns Supabase 클라이언트 인스턴스
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { getToken } = await auth();
  const clerkToken = await getToken();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 무시
          }
        },
      },
      global: {
        fetch: async (url, options = {}) => {
          // Clerk 세션 토큰을 헤더에 추가
          const headers = new Headers(options.headers);
          if (clerkToken) {
            headers.set("Authorization", `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}
