# API 테스트 가이드

이 문서는 프로젝트의 모든 API를 쉽게 테스트하는 방법을 설명합니다.

## 📋 목차

1. [크롤링 API](#크롤링-api)
2. [프롬프트 API](#프롬프트-api)
3. [트렌드 API](#트렌드-api)
4. [계정 API](#계정-api)

---

## 🛠️ 테스트 준비

### 필요한 도구

1. **브라우저** (가장 쉬운 방법)
   - Chrome, Firefox, Edge 등 아무 브라우저나 사용 가능

2. **Postman** (선택사항, 더 편리함)
   - [Postman 다운로드](https://www.postman.com/downloads/)
   - API 테스트를 위한 전문 도구

3. **터미널/명령 프롬프트** (고급 사용자용)
   - curl 명령어 사용

---

## 🕷️ 크롤링 API

### 1. 크롤링 실행 API

**엔드포인트**: `POST /api/crawl/run`

**설명**: 트렌드 데이터를 크롤링하여 데이터베이스에 저장합니다.

**인증**: 내부 API 키 필요 (`INTERNAL_API_KEY` 환경 변수)

#### 방법 1: 브라우저에서 테스트 (불가능)

⚠️ **주의**: 이 API는 POST 메서드이고 인증이 필요하므로 브라우저에서 직접 테스트할 수 없습니다.

#### 방법 2: Postman 사용 (권장)

1. **Postman 실행**
2. **새 요청 생성**
   - Method: `POST` 선택
   - URL 입력: `http://localhost:3000/api/crawl/run`
3. **Headers 설정**
   - Key: `x-internal-api-key`
   - Value: 환경 변수 `INTERNAL_API_KEY` 값 입력
4. **Body 설정** (선택사항)
   - `raw` 선택
   - `JSON` 선택
   - 다음 내용 입력:
   ```json
   {
     "categories": ["product", "blog"],
     "limit": 5
   }
   ```
5. **Send 버튼 클릭**

**응답 예시**:
```json
{
  "success": true,
  "message": "크롤링이 완료되었습니다",
  "duration": "12345ms",
  "results": {
    "product": {
      "packId": "abc123",
      "keywords": 3,
      "itemsCrawled": 15,
      "itemsSaved": 15,
      "itemsSkipped": 0,
      "promptsLinked": 5
    }
  },
  "summary": {
    "categoriesProcessed": 1,
    "totalItemsSaved": 15,
    "totalItemsSkipped": 0,
    "packsCreated": 1
  }
}
```

#### 방법 3: 터미널에서 테스트

```bash
curl -X POST http://localhost:3000/api/crawl/run \
  -H "x-internal-api-key: YOUR_INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"categories": ["product"], "limit": 5}'
```

### 2. 크롤링 상태 조회 API

**엔드포인트**: `GET /api/crawl/status`

**설명**: 크롤링 상태를 조회합니다.

**인증**: 내부 API 키 필요

#### 브라우저에서 테스트

1. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/crawl/status
   ```
2. Enter 키 누르기
3. 결과 확인

⚠️ **주의**: 인증이 필요하므로 실제로는 에러가 발생할 수 있습니다.

---

## 📝 프롬프트 API

### 1. 프롬프트 목록 조회

**엔드포인트**: `GET /api/prompts`

**설명**: 무료 프롬프트 목록을 조회합니다.

**인증**: 불필요 (무료 프롬프트)

#### 브라우저에서 테스트 (가장 쉬움)

1. **브라우저 주소창에 입력**:
   ```
   http://localhost:3000/api/prompts
   ```
2. **Enter 키 누르기**
3. **결과 확인**: JSON 형식으로 프롬프트 목록이 표시됩니다

#### 쿼리 파라미터 사용하기

**카테고리별 필터링**:
```
http://localhost:3000/api/prompts?category=product
```

**페이지네이션**:
```
http://localhost:3000/api/prompts?limit=10&offset=0
```

**복합 사용**:
```
http://localhost:3000/api/prompts?category=blog&limit=20&offset=0
```

**응답 예시**:
```json
{
  "data": [
    {
      "id": "123",
      "title": "상품 분석 프롬프트",
      "description": "상품을 분석하는 프롬프트",
      "category": "product",
      "content": "...",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "offset": 0,
    "total": 100,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. 프롬프트 상세 조회

**엔드포인트**: `GET /api/prompts/[id]`

**설명**: 특정 프롬프트의 상세 정보를 조회합니다.

**인증**: 불필요

#### 브라우저에서 테스트

1. 프롬프트 ID 확인 (목록 API에서 확인)
2. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/prompts/123
   ```
   (123을 실제 프롬프트 ID로 변경)

**응답 예시**:
```json
{
  "id": "123",
  "title": "상품 분석 프롬프트",
  "description": "상품을 분석하는 프롬프트",
  "category": "product",
  "content": "프롬프트 내용...",
  "variables": ["product_name", "price"],
  "example_inputs": {...},
  "created_at": "2025-01-01T00:00:00Z"
}
```

### 3. 프롬프트 사용량 조회

**엔드포인트**: `GET /api/prompts/usage`

**설명**: 프롬프트 사용량을 조회합니다.

**인증**: 필요 (로그인 필요)

#### 브라우저에서 테스트

1. **먼저 로그인** (`/login` 페이지에서)
2. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/prompts/usage
   ```
3. 결과 확인

⚠️ **주의**: 로그인하지 않으면 401 에러가 발생합니다.

---

## 📊 트렌드 API

### 1. 트렌드 목록 조회

**엔드포인트**: `GET /api/trends`

**설명**: 트렌드 패키지 목록을 조회합니다.

**인증**: 필요 (로그인 + 구독 필요)

#### 브라우저에서 테스트

1. **로그인** (`/login` 페이지에서)
2. **구독 확인** (활성 구독이 있어야 함)
3. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/trends
   ```

#### 쿼리 파라미터 사용하기

**카테고리별 필터링**:
```
http://localhost:3000/api/trends?category=product
```

**주차별 필터링**:
```
http://localhost:3000/api/trends?week_key=2025-W01
```

**페이지네이션**:
```
http://localhost:3000/api/trends?limit=10&offset=0
```

**응답 예시**:
```json
{
  "data": [
    {
      "id": "abc123",
      "week_key": "2025-W01",
      "category": "product",
      "title": "2025년 1주차 상품 트렌드",
      "summary": "...",
      "trend_keywords": [...],
      "status": "published",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "offset": 0,
    "total": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### 2. 트렌드 상세 조회

**엔드포인트**: `GET /api/trends/[id]`

**설명**: 특정 트렌드 패키지의 상세 정보를 조회합니다.

**인증**: 필요 (로그인 + 구독 필요)

#### 브라우저에서 테스트

1. 로그인 및 구독 확인
2. 트렌드 ID 확인 (목록 API에서 확인)
3. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/trends/abc123
   ```
   (abc123을 실제 트렌드 ID로 변경)

### 3. 스크래핑된 아이템 조회

**엔드포인트**: `GET /api/trends/[id]/scraped-items`

**설명**: 특정 트렌드 패키지의 스크래핑된 아이템 목록을 조회합니다.

**인증**: 필요 (로그인 + 구독 필요)

#### 브라우저에서 테스트

1. 로그인 및 구독 확인
2. 트렌드 ID 확인
3. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/trends/abc123/scraped-items
   ```

---

## 👤 계정 API

### 1. 이용 기록 조회

**엔드포인트**: `GET /api/account/usage`

**설명**: 사용자의 프롬프트 이용 기록을 조회합니다.

**인증**: 필요 (로그인 필요)

#### 브라우저에서 테스트

1. **로그인** (`/login` 페이지에서)
2. 브라우저 주소창에 입력:
   ```
   http://localhost:3000/api/account/usage
   ```

#### 쿼리 파라미터 사용하기

**페이지네이션**:
```
http://localhost:3000/api/account/usage?page=1&limit=20
```

**응답 예시**:
```json
{
  "data": [
    {
      "id": "usage123",
      "user_id": "user123",
      "prompt_id": "prompt123",
      "pack_id": "pack123",
      "created_at": "2025-01-01T00:00:00Z",
      "prompt_templates": {
        "id": "prompt123",
        "title": "상품 분석 프롬프트",
        "category": "product"
      },
      "trend_packs": {
        "id": "pack123",
        "title": "2025년 1주차 상품 트렌드",
        "category": "product"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🔍 에러 확인 방법

### 브라우저 개발자 도구 사용

1. **F12 키 누르기** (개발자 도구 열기)
2. **Network 탭 클릭**
3. **API 요청 실행** (브라우저 주소창에서 URL 입력)
4. **요청 클릭** → **Response 탭 확인**

### 일반적인 에러 코드

- **401 Unauthorized**: 로그인이 필요하거나 인증 실패
- **403 Forbidden**: 권한이 없음 (구독 필요 등)
- **404 Not Found**: API 엔드포인트가 잘못됨
- **500 Internal Server Error**: 서버 오류

---

## 📱 Postman 사용법 (상세)

### Postman 설치 및 설정

1. **Postman 다운로드**: https://www.postman.com/downloads/
2. **설치 후 실행**
3. **새 요청 생성**: `+` 버튼 클릭

### GET 요청 예시

1. Method: `GET` 선택
2. URL 입력: `http://localhost:3000/api/prompts`
3. **Params 탭**에서 쿼리 파라미터 추가:
   - Key: `category`, Value: `product`
   - Key: `limit`, Value: `10`
4. **Send 버튼 클릭**

### POST 요청 예시

1. Method: `POST` 선택
2. URL 입력: `http://localhost:3000/api/crawl/run`
3. **Headers 탭**에서 헤더 추가:
   - Key: `x-internal-api-key`, Value: `YOUR_KEY`
   - Key: `Content-Type`, Value: `application/json`
4. **Body 탭** 선택:
   - `raw` 선택
   - `JSON` 선택
   - JSON 데이터 입력
5. **Send 버튼 클릭**

---

## 🧪 테스트 체크리스트

### 크롤링 API
- [ ] 크롤링 실행 API 테스트 (Postman 사용)
- [ ] 크롤링 상태 조회 API 테스트

### 프롬프트 API
- [ ] 프롬프트 목록 조회 (브라우저)
- [ ] 카테고리 필터링 테스트
- [ ] 페이지네이션 테스트
- [ ] 프롬프트 상세 조회 테스트
- [ ] 프롬프트 사용량 조회 테스트 (로그인 후)

### 트렌드 API
- [ ] 트렌드 목록 조회 (로그인 + 구독 후)
- [ ] 카테고리 필터링 테스트
- [ ] 주차 필터링 테스트
- [ ] 트렌드 상세 조회 테스트
- [ ] 스크래핑된 아이템 조회 테스트

### 계정 API
- [ ] 이용 기록 조회 (로그인 후)
- [ ] 페이지네이션 테스트

---

## 💡 팁

### 1. JSON 보기 좋게 보기

브라우저에서 JSON이 한 줄로 보일 때:
- Chrome 확장 프로그램: "JSON Viewer" 설치
- 또는 브라우저 콘솔에서:
  ```javascript
  JSON.parse(responseText)
  ```

### 2. 빠른 테스트를 위한 북마크

자주 사용하는 API URL을 브라우저 북마크에 저장:
- 프롬프트 목록: `http://localhost:3000/api/prompts`
- 트렌드 목록: `http://localhost:3000/api/trends`

### 3. 환경 변수 확인

API가 작동하지 않을 때:
- 환경 변수가 올바르게 설정되어 있는지 확인
- 개발 서버가 실행 중인지 확인 (`pnpm run dev`)

---

## 🔗 관련 문서

- [개발 환경 체크리스트](./DEVELOPMENT_CHECKLIST.md)
- [API 에러 처리 가이드](./API_ERROR_HANDLING.md) (있는 경우)

---

**마지막 업데이트**: 2025-01-XX

