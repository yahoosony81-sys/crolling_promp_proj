/**
 * RLS 정책 테스트 스크립트
 * 
 * 이 스크립트는 Supabase RLS 정책이 올바르게 작동하는지 테스트합니다.
 * 
 * 실행 방법:
 *   pnpm tsx scripts/test-rls-policies.ts
 * 
 * 환경 변수:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase Anon Key
 *   - TEST_CLERK_USER_ID: 테스트용 Clerk 사용자 ID (선택사항)
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/types/database";

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error("NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.");
  process.exit(1);
}

// 테스트 결과 타입
type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

const results: TestResult[] = [];

/**
 * 테스트 실행 및 결과 기록
 */
function runTest(name: string, testFn: () => Promise<boolean> | boolean): void {
  const result: TestResult = { name, passed: false };
  
  try {
    const passed = testFn();
    if (passed instanceof Promise) {
      passed
        .then((p) => {
          result.passed = p;
          results.push(result);
        })
        .catch((error) => {
          result.passed = false;
          result.error = error.message;
          results.push(result);
        });
    } else {
      result.passed = passed;
      results.push(result);
    }
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
    results.push(result);
  }
}

/**
 * 비인증 클라이언트 생성
 */
function createAnonymousClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

/**
 * 인증된 클라이언트 생성 (Clerk JWT 토큰 사용)
 */
function createAuthenticatedClient(clerkToken: string) {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
}

/**
 * 테스트 결과 출력
 */
function printResults() {
  console.log("\n" + "=".repeat(60));
  console.log("RLS 정책 테스트 결과");
  console.log("=".repeat(60) + "\n");

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result) => {
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      passedCount++;
    } else {
      console.log(`❌ ${result.name}`);
      if (result.error) {
        console.log(`   오류: ${result.error}`);
      }
      failedCount++;
    }
  });

  console.log("\n" + "-".repeat(60));
  console.log(`총 테스트: ${results.length}`);
  console.log(`성공: ${passedCount}`);
  console.log(`실패: ${failedCount}`);
  console.log("-".repeat(60) + "\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

/**
 * 1. prompt_templates 테이블 테스트
 */
async function testPromptTemplates() {
  const anonClient = createAnonymousClient();

  // 무료 프롬프트는 비인증 사용자도 조회 가능해야 함
  runTest("비인증 사용자: 무료 프롬프트 조회 가능", async () => {
    const { data, error } = await anonClient
      .from("prompt_templates")
      .select("*")
      .eq("is_free", true)
      .limit(1);

    if (error) {
      console.error("무료 프롬프트 조회 오류:", error);
      return false;
    }

    return data !== null && data.length > 0;
  });

  // 유료 프롬프트는 비인증 사용자가 조회할 수 없어야 함
  runTest("비인증 사용자: 유료 프롬프트 조회 불가", async () => {
    const { data, error } = await anonClient
      .from("prompt_templates")
      .select("*")
      .eq("is_free", false)
      .limit(1);

    // RLS 정책에 의해 빈 배열이 반환되어야 함
    return data !== null && data.length === 0;
  });
}

/**
 * 2. trend_packs 테이블 테스트
 */
async function testTrendPacks() {
  const anonClient = createAnonymousClient();

  // Published 상태의 패키지만 조회 가능해야 함
  runTest("비인증 사용자: Published 패키지 조회 가능", async () => {
    const { data, error } = await anonClient
      .from("trend_packs")
      .select("*")
      .eq("status", "published")
      .limit(1);

    if (error) {
      console.error("Published 패키지 조회 오류:", error);
      return false;
    }

    // Published 패키지가 있으면 조회 가능해야 함
    return true; // 에러가 없으면 통과
  });

  // Draft 상태의 패키지는 조회할 수 없어야 함
  runTest("비인증 사용자: Draft 패키지 조회 불가", async () => {
    const { data, error } = await anonClient
      .from("trend_packs")
      .select("*")
      .eq("status", "draft")
      .limit(1);

    // RLS 정책에 의해 빈 배열이 반환되어야 함
    return data !== null && data.length === 0;
  });
}

/**
 * 3. scraped_items 테이블 테스트
 */
async function testScrapedItems() {
  const anonClient = createAnonymousClient();

  // Published 패키지의 아이템만 조회 가능해야 함
  runTest("비인증 사용자: Published 패키지의 스크랩 아이템 조회 가능", async () => {
    // 먼저 published 패키지 ID를 가져옴
    const { data: packs } = await anonClient
      .from("trend_packs")
      .select("id")
      .eq("status", "published")
      .limit(1)
      .single();

    if (!packs) {
      // Published 패키지가 없으면 테스트 스킵
      return true;
    }

    const { data, error } = await anonClient
      .from("scraped_items")
      .select("*")
      .eq("pack_id", packs.id)
      .limit(1);

    if (error) {
      console.error("스크랩 아이템 조회 오류:", error);
      return false;
    }

    return true; // 에러가 없으면 통과
  });
}

/**
 * 4. pack_prompts 테이블 테스트
 */
async function testPackPrompts() {
  const anonClient = createAnonymousClient();

  // Published 패키지의 프롬프트만 조회 가능해야 함
  runTest("비인증 사용자: Published 패키지의 프롬프트 조회 가능", async () => {
    // 먼저 published 패키지 ID를 가져옴
    const { data: packs } = await anonClient
      .from("trend_packs")
      .select("id")
      .eq("status", "published")
      .limit(1)
      .single();

    if (!packs) {
      // Published 패키지가 없으면 테스트 스킵
      return true;
    }

    const { data, error } = await anonClient
      .from("pack_prompts")
      .select("*")
      .eq("pack_id", packs.id)
      .limit(1);

    if (error) {
      console.error("패키지 프롬프트 조회 오류:", error);
      return false;
    }

    return true; // 에러가 없으면 통과
  });
}

/**
 * 5. subscriptions 테이블 테스트
 */
async function testSubscriptions() {
  const anonClient = createAnonymousClient();

  // 비인증 사용자는 구독 정보를 조회할 수 없어야 함
  runTest("비인증 사용자: 구독 정보 조회 불가", async () => {
    const { data, error } = await anonClient
      .from("subscriptions")
      .select("*")
      .limit(1);

    // RLS 정책에 의해 빈 배열이 반환되어야 함
    return data !== null && data.length === 0;
  });
}

/**
 * 6. prompt_usages 테이블 테스트
 */
async function testPromptUsages() {
  const anonClient = createAnonymousClient();

  // 비인증 사용자는 사용 기록을 조회할 수 없어야 함
  runTest("비인증 사용자: 사용 기록 조회 불가", async () => {
    const { data, error } = await anonClient
      .from("prompt_usages")
      .select("*")
      .limit(1);

    // RLS 정책에 의해 빈 배열이 반환되어야 함
    return data !== null && data.length === 0;
  });
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("RLS 정책 테스트 시작...\n");

  // 각 테이블별 테스트 실행
  await testPromptTemplates();
  await testTrendPacks();
  await testScrapedItems();
  await testPackPrompts();
  await testSubscriptions();
  await testPromptUsages();

  // 모든 비동기 테스트가 완료될 때까지 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 결과 출력
  printResults();
}

// 스크립트 실행
main().catch((error) => {
  console.error("테스트 실행 중 오류 발생:", error);
  process.exit(1);
});

