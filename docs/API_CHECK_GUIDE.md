# API 확인 가이드 - 상세 설명

이 문서는 각 API를 어디서 확인하고, 어떻게 접근하는지 단계별로 설명합니다.

---

## 📁 프로젝트 구조 이해하기

모든 API 파일은 `src/app/api/` 폴더 안에 있습니다.

```
src/app/api/
├── account/          # 계정 관련 API
│   └── usage/        # 이용 기록 API
├── crawl/            # 크롤링 관련 API
│   ├── run/          # 크롤링 실행 API
│   └── status/       # 크롤링 상태 확인 API
├── prompts/          # 프롬프트 관련 API
│   ├── [id]/         # 특정 프롬프트 조회 API
│   ├── route.ts      # 프롬프트 목록 API
│   └── usage/        # 프롬프트 사용 기록 API
├── trends/           # 트렌드 관련 API
│   ├── [id]/         # 특정 트렌드 조회 API
│   ├── route.ts      # 트렌드 목록 API
│   └── [id]/scraped-items/  # 스크랩된 아이템 조회 API
├── subscriptions/    # 구독 관련 API
└── webhooks/         # 웹훅 관련 API
```

---

## 1. 🕷️ 크롤링 API (`/api/crawl/run`)

### 📍 파일 위치
```
src/app/api/crawl/run/route.ts
```

### 📝 코드에서 확인하는 방법

**1단계: 파일 열기**
- VS Code나 Cursor에서 프로젝트 열기
- 왼쪽 파일 탐색기에서 `src` → `app` → `api` → `crawl` → `run` → `route.ts` 클릭

**2단계: 코드 확인**
- 파일을 열면 크롤링 API의 전체 코드를 볼 수 있습니다
- 주요 부분:
  - `POSTHandler` 함수: 실제 크롤링을 실행하는 코드
  - `VALID_CATEGORIES`: 지원하는 카테고리 목록
  - 에러 처리 로직

**3단계: 로그 확인**
- 크롤링 실행 시 콘솔에 로그가 출력됩니다
- 터미널에서 `pnpm run dev` 실행 중인 상태에서 확인 가능

### 🌐 브라우저에서 확인하는 방법

**주의:** 이 API는 POST 메서드만 지원하므로 브라우저에서 직접 확인하기 어렵습니다. Postman이나 다른 도구를 사용해야 합니다.

### 🔧 Postman으로 확인하는 방법

**1단계: Postman 설치**
- Postman 다운로드: https://www.postman.com/downloads/
- 설치 후 실행

**2단계: 새 요청 만들기**
1. Postman 열기
2. 왼쪽 상단 "New" 버튼 클릭
3. "HTTP Request" 선택

**3단계: 요청 설정**
- **Method**: `POST` 선택
- **URL**: `http://localhost:3000/api/crawl/run` 입력
- **Headers 탭** 클릭:
  - Key: `Content-Type`
  - Value: `application/json`
  - Key: `x-internal-api-key` (환경 변수에서 확인 필요)
  - Value: (`.env.local` 파일의 `INTERNAL_API_KEY` 값)

**4단계: Body 설정 (선택사항)**
- Body 탭 클릭
- "raw" 선택
- "JSON" 선택
- 다음 내용 입력:
```json
{
  "categories": ["product"],
  "limit": 5
}
```

**5단계: 서버 실행 확인**
- 터미널에서 `pnpm run dev` 실행 중인지 확인
- 실행 중이 아니면 실행 필요

**6단계: 요청 보내기**
- 오른쪽 상단 "Send" 버튼 클릭

**7단계: 결과 확인**
- 성공 시: JSON 형식으로 결과가 표시됨
  ```json
  {
    "success": true,
    "message": "크롤링이 완료되었습니다",
    "duration": "12345ms",
    "results": { ... },
    "summary": { ... }
  }
  ```
- 실패 시: 에러 메시지 확인

### ✅ 정상 작동 확인 포인트
- ✅ `success: true` 응답
- ✅ `results` 객체에 각 카테고리별 결과 포함
- ✅ `summary`에 저장된 아이템 수 표시
- ✅ 데이터베이스에 새로운 트렌드 패키지 생성됨

---

## 2. 📝 프롬프트 API (`/api/prompts`)

### 📍 파일 위치
```
src/app/api/prompts/route.ts
```

### 📝 코드에서 확인하는 방법

**1단계: 파일 열기**
- 파일 탐색기에서 `src` → `app` → `api` → `prompts` → `route.ts` 클릭

**2단계: 코드 확인**
- `GETHandler` 함수: 프롬프트 목록을 가져오는 코드
- 쿼리 파라미터 처리: `category`, `limit`, `offset`
- Supabase 쿼리: 데이터베이스에서 프롬프트를 가져오는 부분

### 🌐 브라우저에서 확인하는 방법

**1단계: 서버 실행**
- 터미널에서 `pnpm run dev` 실행 (사용자가 직접 실행)

**2단계: 브라우저 열기**
- 브라우저 주소창에 입력: `http://localhost:3000/api/prompts`

**3단계: 결과 확인**
- JSON 형식으로 프롬프트 목록이 표시됨:
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "category": "...",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    ...
  }
}
```

**4단계: 필터링 테스트**
- 카테고리별 필터링: `http://localhost:3000/api/prompts?category=product`
- 페이지네이션: `http://localhost:3000/api/prompts?limit=10&offset=0`

### 🔧 Postman으로 확인하는 방법

**1단계: 새 요청 만들기**
- Method: `GET`
- URL: `http://localhost:3000/api/prompts`

**2단계: 쿼리 파라미터 추가 (선택사항)**
- Params 탭 클릭
- Key: `category`, Value: `product`
- Key: `limit`, Value: `10`
- Key: `offset`, Value: `0`

**3단계: 요청 보내기**
- "Send" 버튼 클릭

### ✅ 정상 작동 확인 포인트
- ✅ `data` 배열에 프롬프트 목록이 포함됨
- ✅ `pagination` 객체가 정확한 정보를 표시함
- ✅ 각 프롬프트에 `id`, `title`, `description` 등 필수 필드가 있음
- ✅ `is_free: true`인 프롬프트만 표시됨

---

## 3. 📊 트렌드 API (`/api/trends`)

### 📍 파일 위치
```
src/app/api/trends/route.ts
```

### 📝 코드에서 확인하는 방법

**1단계: 파일 열기**
- 파일 탐색기에서 `src` → `app` → `api` → `trends` → `route.ts` 클릭

**2단계: 코드 확인**
- `GETHandler` 함수: 트렌드 목록을 가져오는 코드
- `requireSubscription()`: 구독 확인 로직
- 쿼리 파라미터: `category`, `week_key`, `limit`, `offset`

### 🌐 브라우저에서 확인하는 방법

**주의:** 이 API는 로그인과 구독이 필요합니다.

**1단계: 로그인**
- 브라우저에서 `http://localhost:3000` 접속
- 로그인 완료

**2단계: 구독 확인**
- 구독이 활성화되어 있어야 함

**3단계: API 접근**
- 브라우저 주소창에 입력: `http://localhost:3000/api/trends`
- 로그인 상태가 유지되어 있어야 함 (쿠키/세션)

**4단계: 결과 확인**
- 성공 시: JSON 형식으로 트렌드 목록 표시
- 401 에러: 로그인이 필요함
- 403 에러: 구독이 필요함

### 🔧 Postman으로 확인하는 방법

**1단계: 인증 토큰 가져오기**
- 브라우저에서 로그인 후 개발자 도구 열기 (F12)
- Application 탭 → Cookies → `__clerk_db_jwt` 값 복사
- 또는 Network 탭에서 요청 헤더의 `Authorization` 값 확인

**2단계: 새 요청 만들기**
- Method: `GET`
- URL: `http://localhost:3000/api/trends`

**3단계: 헤더 설정**
- Headers 탭 클릭
- Key: `Authorization`
- Value: `Bearer [토큰값]` (실제 토큰 값 입력)

**4단계: 쿼리 파라미터 추가 (선택사항)**
- Params 탭 클릭
- Key: `category`, Value: `product`
- Key: `week_key`, Value: `2025-W50`

**5단계: 요청 보내기**
- "Send" 버튼 클릭

### ✅ 정상 작동 확인 포인트
- ✅ `data` 배열에 트렌드 패키지 목록이 포함됨
- ✅ 각 트렌드에 `id`, `title`, `summary`, `trend_keywords` 등 필수 필드가 있음
- ✅ `status: "published"`인 트렌드만 표시됨
- ✅ 구독 확인이 정상 작동함

---

## 4. 👤 계정 API (`/api/account/usage`)

### 📍 파일 위치
```
src/app/api/account/usage/route.ts
```

### 📝 코드에서 확인하는 방법

**1단계: 파일 열기**
- 파일 탐색기에서 `src` → `app` → `api` → `account` → `usage` → `route.ts` 클릭

**2단계: 코드 확인**
- `GET` 함수: 이용 기록을 가져오는 코드
- `auth()`: Clerk 인증 확인
- Supabase 쿼리: `prompt_usages` 테이블에서 데이터 조회
- 조인 쿼리: `prompt_templates`와 `trend_packs` 테이블 조인

### 🌐 브라우저에서 확인하는 방법

**주의:** 이 API는 로그인이 필요합니다.

**1단계: 로그인**
- 브라우저에서 `http://localhost:3000` 접속
- 로그인 완료

**2단계: API 접근**
- 브라우저 주소창에 입력: `http://localhost:3000/api/account/usage`
- 로그인 상태가 유지되어 있어야 함

**3단계: 결과 확인**
- 성공 시: JSON 형식으로 이용 기록 표시
- 401 에러: 로그인이 필요함

**4단계: 페이지네이션 테스트**
- `http://localhost:3000/api/account/usage?page=1&limit=10`
- `http://localhost:3000/api/account/usage?page=2&limit=20`

### 🔧 Postman으로 확인하는 방법

**1단계: 인증 토큰 가져오기**
- 브라우저에서 로그인 후 개발자 도구 열기 (F12)
- Application 탭 → Cookies → `__clerk_db_jwt` 값 복사

**2단계: 새 요청 만들기**
- Method: `GET`
- URL: `http://localhost:3000/api/account/usage`

**3단계: 헤더 설정**
- Headers 탭 클릭
- Key: `Authorization`
- Value: `Bearer [토큰값]`

**4단계: 쿼리 파라미터 추가 (선택사항)**
- Params 탭 클릭
- Key: `page`, Value: `1`
- Key: `limit`, Value: `20`

**5단계: 요청 보내기**
- "Send" 버튼 클릭

### ✅ 정상 작동 확인 포인트
- ✅ `data` 배열에 이용 기록이 포함됨
- ✅ 각 기록에 `prompt_templates`와 `trend_packs` 정보가 조인되어 있음
- ✅ `pagination` 객체가 정확한 정보를 표시함
- ✅ 현재 로그인한 사용자의 기록만 표시됨

---

## 5. 📋 특정 프롬프트 조회 API (`/api/prompts/[id]`)

### 📍 파일 위치
```
src/app/api/prompts/[id]/route.ts
```

### 🌐 브라우저에서 확인하는 방법

**1단계: 프롬프트 ID 확인**
- 먼저 `/api/prompts`로 프롬프트 목록 조회
- 원하는 프롬프트의 `id` 값 복사

**2단계: API 접근**
- 브라우저 주소창에 입력: `http://localhost:3000/api/prompts/[프롬프트ID]`
- 예시: `http://localhost:3000/api/prompts/123e4567-e89b-12d3-a456-426614174000`

**3단계: 결과 확인**
- 성공 시: 해당 프롬프트의 상세 정보 표시
- 404 에러: 프롬프트를 찾을 수 없음

---

## 6. 📊 특정 트렌드 조회 API (`/api/trends/[id]`)

### 📍 파일 위치
```
src/app/api/trends/[id]/route.ts
```

### 🌐 브라우저에서 확인하는 방법

**주의:** 로그인과 구독이 필요합니다.

**1단계: 트렌드 ID 확인**
- 먼저 `/api/trends`로 트렌드 목록 조회
- 원하는 트렌드의 `id` 값 복사

**2단계: 로그인 및 구독 확인**
- 로그인 완료
- 구독 활성화 확인

**3단계: API 접근**
- 브라우저 주소창에 입력: `http://localhost:3000/api/trends/[트렌드ID]`
- 예시: `http://localhost:3000/api/trends/123e4567-e89b-12d3-a456-426614174000`

**4단계: 결과 확인**
- 성공 시: 해당 트렌드의 상세 정보 표시
- 401 에러: 로그인이 필요함
- 403 에러: 구독이 필요함
- 404 에러: 트렌드를 찾을 수 없음

---

## 🛠️ 개발자 도구로 확인하는 방법

### 브라우저 개발자 도구 사용

**1단계: 개발자 도구 열기**
- 브라우저에서 F12 키 누르기
- 또는 우클릭 → "검사" 선택

**2단계: Network 탭 확인**
- 개발자 도구에서 "Network" 탭 클릭
- 페이지에서 API를 호출하는 작업 수행
- 네트워크 요청 목록에서 API 호출 확인

**3단계: 요청 상세 확인**
- API 요청 클릭
- "Headers" 탭: 요청 헤더 확인
- "Payload" 탭: 요청 데이터 확인
- "Response" 탭: 응답 데이터 확인
- "Preview" 탭: JSON 형식으로 보기 좋게 표시

**4단계: Console 탭 확인**
- "Console" 탭 클릭
- API 호출 시 에러 메시지 확인
- `console.log`로 출력된 로그 확인

---

## 📊 API 상태 확인 체크리스트

### 매일 확인할 것
- [ ] 프롬프트 API (`/api/prompts`) - 브라우저에서 직접 확인
- [ ] 트렌드 API (`/api/trends`) - 로그인 후 브라우저에서 확인

### 주간 확인할 것
- [ ] 크롤링 API (`/api/crawl/run`) - Postman으로 실행 및 결과 확인
- [ ] 계정 API (`/api/account/usage`) - 로그인 후 브라우저에서 확인

### 문제 발생 시 확인할 것
- [ ] 개발자 도구 Network 탭에서 에러 확인
- [ ] 터미널 콘솔에서 에러 로그 확인
- [ ] 각 API의 파일 위치에서 코드 확인

---

## 🚨 자주 발생하는 문제와 해결 방법

### 문제 1: "401 Unauthorized" 에러
**원인**: 로그인이 필요함
**해결**: 브라우저에서 로그인 후 다시 시도

### 문제 2: "403 Forbidden" 에러
**원인**: 구독이 필요함
**해결**: 구독 활성화 후 다시 시도

### 문제 3: "404 Not Found" 에러
**원인**: API 경로가 잘못되었거나 리소스를 찾을 수 없음
**해결**: 
- API 경로 확인 (`/api/...`)
- 리소스 ID가 올바른지 확인

### 문제 4: "500 Internal Server Error" 에러
**원인**: 서버 내부 오류
**해결**:
- 터미널 콘솔에서 에러 로그 확인
- 데이터베이스 연결 확인
- 환경 변수 확인 (`.env.local`)

### 문제 5: Postman에서 인증 실패
**원인**: 인증 토큰이 없거나 만료됨
**해결**:
- 브라우저에서 다시 로그인
- 개발자 도구에서 최신 토큰 복사
- Postman 헤더에 올바른 토큰 입력

---

## 💡 팁

### 1. VS Code에서 파일 빠르게 찾기
- `Ctrl + P` (Windows) 또는 `Cmd + P` (Mac) 누르기
- 파일 이름 입력 (예: `route.ts`)
- 원하는 파일 선택

### 2. 브라우저에서 JSON 보기 좋게 보기
- Chrome 확장 프로그램 "JSON Viewer" 설치
- 또는 개발자 도구의 "Preview" 탭 사용

### 3. API 테스트를 위한 환경 설정
- Postman에 환경 변수 설정
  - `base_url`: `http://localhost:3000`
  - `api_key`: (환경 변수에서 가져온 값)
- 요청 URL에 `{{base_url}}/api/...` 형식으로 사용

---

**요약: 각 API는 `src/app/api/` 폴더 안에 있으며, 브라우저나 Postman으로 확인할 수 있습니다. 로그인이 필요한 API는 인증 토큰을 헤더에 포함해야 합니다!**


