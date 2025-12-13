"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk와 Supabase를 통합한 클라이언트 사이드 Supabase 클라이언트 Hook
 * 
 * 이 hook은 React 컴포넌트 내에서만 사용할 수 있습니다.
 * Clerk 세션 토큰을 Supabase 요청에 자동으로 포함시킵니다.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useSupabaseClient } from '@/lib/supabase/client-hook'
 * 
 * export default function MyComponent() {
 *   const supabase = useSupabaseClient()
 *   
 *   const fetchData = async () => {
 *     const { data } = await supabase.from('tasks').select()
 *   }
 *   
 *   return <div>...</div>
 * }
 * ```
 * 
 * @returns Supabase 클라이언트 인스턴스
 */
export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(() => {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            // Clerk 세션 토큰을 헤더에 추가
            const clerkToken = await session?.getToken();
            
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
  }, [session]);
}

