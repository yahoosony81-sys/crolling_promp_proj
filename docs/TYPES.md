# 타입 정의 가이드

이 문서는 TrendScrape Prompt 프로젝트의 타입 정의 및 사용 방법을 설명합니다.

## 데이터베이스 타입

### 타입 생성

Supabase 데이터베이스 스키마를 기반으로 TypeScript 타입을 자동 생성합니다.

#### 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id
```

#### 타입 생성 명령어

```bash
pnpm run gen:types
```

이 명령어는 Supabase CLI를 사용하여 데이터베이스 스키마를 읽고 TypeScript 타입을 생성합니다. 생성된 타입은 `src/lib/types/database.ts` 파일에 저장됩니다.

**참고**: 환경 변수가 설정되지 않은 경우, 기본값으로 하드코딩된 프로젝트 ID를 사용합니다.

### 타입 파일 위치

- **생성 위치**: `src/lib/types/database.ts`
- **이전 위치**: `database.types.ts` (루트 디렉토리)

### 타입 사용 방법

#### 1. 타입 Import

```typescript
import type { Database } from "@/lib/types/database";
```

#### 2. 테이블 타입 사용

```typescript
// Row 타입 (조회 결과)
type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

// Insert 타입 (삽입 데이터)
type NewPromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Insert"];

// Update 타입 (업데이트 데이터)
type UpdatePromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Update"];
```

#### 3. Supabase 클라이언트에 타입 적용

모든 Supabase 클라이언트는 이미 Database 타입이 적용되어 있습니다:

- `src/lib/supabase/server.ts` - 서버 사이드 클라이언트
- `src/lib/supabase/client.ts` - 클라이언트 사이드 클라이언트
- `src/lib/supabase/client-hook.ts` - React Hook 클라이언트
- `src/lib/supabase/server-admin.ts` - 관리자 클라이언트

**예시**:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function MyComponent() {
  const supabase = await createClient();
  
  // 타입 안전한 쿼리
  const { data } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("is_free", true);
  
  // data는 자동으로 PromptTemplate[] 타입으로 추론됩니다
  return <div>...</div>;
}
```

### 포함된 테이블 타입

다음 테이블들의 타입이 자동 생성됩니다:

- `prompt_templates` - 프롬프트 템플릿
- `trend_packs` - 트렌드 패키지
- `scraped_items` - 스크랩된 아이템
- `pack_prompts` - 패키지-프롬프트 연결
- `subscriptions` - 구독 정보
- `prompt_usages` - 프롬프트 사용 기록

### 타입 재생성 시점

다음과 같은 경우 타입을 재생성해야 합니다:

1. 데이터베이스 스키마 변경 시
2. 새로운 테이블 추가 시
3. 테이블 컬럼 추가/수정/삭제 시
4. 인덱스나 제약조건 변경 시

### 타입 안정성

타입이 적용된 Supabase 클라이언트를 사용하면:

- ✅ 자동완성 지원
- ✅ 타입 체크로 런타임 에러 방지
- ✅ 테이블명 오타 방지
- ✅ 컬럼명 오타 방지
- ✅ 잘못된 데이터 타입 사용 방지

### 문제 해결

#### 타입이 업데이트되지 않는 경우

1. `.env.local` 파일에 올바른 프로젝트 ID가 설정되어 있는지 확인
2. `pnpm run gen:types` 명령어를 다시 실행
3. 생성된 타입 파일이 `src/lib/types/database.ts`에 올바르게 저장되었는지 확인

#### 타입 에러가 발생하는 경우

1. TypeScript 서버 재시작 (VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server")
2. 모든 파일의 import 경로가 `@/lib/types/database`를 사용하는지 확인
3. Supabase 클라이언트에 Database 타입이 적용되어 있는지 확인

## 기타 타입 정의

프로젝트에는 데이터베이스 타입 외에도 다음과 같은 타입 정의가 있습니다:

- `src/lib/types/prompt.ts` - 프롬프트 관련 타입
- `src/lib/types/payment.ts` - 결제 관련 타입
- `src/lib/types/webhook.ts` - 웹훅 관련 타입
- `src/lib/types/crawler.ts` - 크롤링 관련 타입

이러한 타입들은 프로젝트 특화 타입으로, 데이터베이스 타입과 함께 사용됩니다.

