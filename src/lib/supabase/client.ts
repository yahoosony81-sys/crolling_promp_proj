"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk와 Supabase를 통합한 클라이언트 사이드 Supabase 클라이언트 생성
 * 
 * Supabase 공식 문서의 모범 사례를 따르며, Clerk 세션 토큰을 자동으로 포함시킵니다.
 * React 컴포넌트 내에서만 사용할 수 있으며, useMemo를 사용하여 성능을 최적화합니다.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export default function MyComponent() {
 *   const supabase = createClient()
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
export function createClient() {
  const { session } = useSession();

  return useMemo(() => {
    return createBrowserClient(
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
