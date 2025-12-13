# Toss Payments 웹훅 설정 가이드

이 문서는 Toss Payments 웹훅을 설정하고 사용하는 방법을 설명합니다.

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Toss Payments 웹훅 시크릿 키
# Toss Payments 대시보드 > 개발 > 웹훅 설정에서 확인할 수 있습니다
TOSS_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_key

# Toss Payments 시크릿 키 (결제 API 사용 시 필요)
TOSS_PAYMENTS_SECRET_KEY=your_secret_key
```

## 웹훅 엔드포인트

웹훅 엔드포인트: `POST /api/webhooks/toss`

프로덕션 환경의 경우:
```
https://your-domain.com/api/webhooks/toss
```

## Toss Payments 대시보드 설정

1. [Toss Payments 대시보드](https://dashboard.tosspayments.com)에 로그인
2. **개발** > **웹훅** 메뉴로 이동
3. **웹훅 URL**에 위 엔드포인트 URL 입력
4. **웹훅 시크릿 키** 복사하여 환경 변수에 설정
5. 수신할 이벤트 선택:
   - `billing.approved` (정기결제 성공)
   - `billing.failed` (정기결제 실패)
   - `billing.canceled` (정기결제 취소)

## 지원하는 웹훅 이벤트

### billing.approved
정기결제가 성공적으로 완료되었을 때 발생합니다.

**처리 내용:**
- 구독이 존재하지 않으면 새로 생성
- 구독이 존재하면 기간 연장 및 상태를 'active'로 변경
- `current_period_start`, `current_period_end` 업데이트

### billing.failed
정기결제가 실패했을 때 발생합니다.

**처리 내용:**
- 구독 상태를 'past_due'로 변경
- 사용자에게 결제 재시도 안내 필요 (별도 구현)

### billing.canceled
정기결제가 취소되었을 때 발생합니다.

**처리 내용:**
- 구독 상태를 'canceled'로 변경
- `canceled_at` 타임스탬프 설정

## 로컬 개발 환경 테스트

로컬 개발 환경에서 웹훅을 테스트하려면:

1. **ngrok** 또는 유사한 터널링 도구 사용:
   ```bash
   ngrok http 3000
   ```

2. ngrok에서 제공하는 URL을 Toss Payments 웹훅 URL로 설정:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/toss
   ```

3. Toss Payments 대시보드에서 테스트 웹훅 전송

## 보안 고려사항

1. **서명 검증**: 모든 웹훅 요청은 자동으로 서명 검증을 거칩니다.
2. **환경 변수 보안**: `TOSS_PAYMENTS_WEBHOOK_SECRET`는 절대 공개 저장소에 커밋하지 마세요.
3. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요.

## 문제 해결

### 서명 검증 실패 (401 Unauthorized)

- `TOSS_PAYMENTS_WEBHOOK_SECRET` 환경 변수가 올바르게 설정되었는지 확인
- Toss Payments 대시보드의 웹훅 시크릿 키와 일치하는지 확인
- 요청 본문이 원본 그대로 전달되는지 확인 (JSON 파싱 전에 서명 검증)

### 구독이 업데이트되지 않음

- 웹훅 로그 확인 (`logWebhookEvent` 함수의 출력)
- `customerKey`가 올바른 Clerk user ID인지 확인
- Supabase 데이터베이스 연결 상태 확인

### 중복 이벤트 처리

현재 구현은 idempotency 키를 사용하지 않습니다. 동일한 이벤트가 여러 번 전송될 경우를 대비하여 향후 구현이 필요할 수 있습니다.

## 참고 자료

- [Toss Payments 웹훅 문서](https://docs.tosspayments.com/reference/webhook-api)
- [Toss Payments 정기결제 문서](https://docs.tosspayments.com/guides/billing)

---

# Clerk 웹훅 설정 가이드

이 문서는 Clerk 웹훅을 설정하고 사용하는 방법을 설명합니다.

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Clerk 웹훅 시크릿 키
# Clerk 대시보드 > Webhooks > Endpoints에서 확인할 수 있습니다
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Service Role Key (사용자 동기화에 필요)
# Supabase 대시보드 > Project Settings > API에서 확인할 수 있습니다
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## 웹훅 엔드포인트

웹훅 엔드포인트: `POST /api/webhooks/clerk`

로컬 개발 환경:
```
http://localhost:3000/api/webhooks/clerk
```

프로덕션 환경:
```
https://your-domain.com/api/webhooks/clerk
```

## Clerk 대시보드 설정

### 1단계: Clerk 대시보드 접속
1. [Clerk 대시보드](https://dashboard.clerk.com)에 로그인
2. 왼쪽 사이드바에서 **Webhooks** 메뉴 클릭

### 2단계: 웹훅 엔드포인트 생성
1. **Add Endpoint** 버튼 클릭
2. **Endpoint URL** 입력란에 다음 URL 입력:
   - 로컬 개발: `http://localhost:3000/api/webhooks/clerk` (ngrok URL 사용)
   - 프로덕션: `https://your-domain.com/api/webhooks/clerk`

### 3단계: 웹훅 시크릿 키 확인 및 복사
1. 엔드포인트 생성 후, 엔드포인트 상세 페이지로 이동
2. **Signing Secret** 섹션 찾기
3. **Reveal** 또는 **Show** 버튼 클릭하여 시크릿 키 표시
4. 시크릿 키 복사 (형식: `whsec_`로 시작하는 긴 문자열)
   - 예시: `whsec_AbCdEf123456...`
5. 복사한 시크릿 키를 `.env.local` 파일에 추가:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_복사한_값_여기에_붙여넣기
   ```

### 4단계: 수신할 이벤트 선택
엔드포인트 설정에서 다음 이벤트들을 선택:
- ✅ `user.created` (사용자 생성)
- ✅ `user.updated` (사용자 업데이트)
- ✅ `user.deleted` (사용자 삭제)

### 5단계: 저장 및 활성화
1. **Save** 또는 **Create Endpoint** 버튼 클릭
2. 엔드포인트가 활성화되면 웹훅 수신 시작

## 웹훅 시크릿 키 찾기 (기존 엔드포인트)

이미 엔드포인트가 생성되어 있는 경우:

1. **Webhooks** 메뉴로 이동
2. 엔드포인트 목록에서 해당 엔드포인트 클릭
3. 엔드포인트 상세 페이지에서 **Signing Secret** 섹션 확인
4. **Reveal** 버튼 클릭하여 시크릿 키 표시
5. 복사하여 환경 변수에 설정

**주의사항:**
- 시크릿 키는 보안상 한 번만 표시될 수 있습니다
- 시크릿 키를 잃어버린 경우, 엔드포인트를 삭제하고 새로 생성해야 합니다
- 각 엔드포인트마다 고유한 시크릿 키가 있습니다

## 지원하는 웹훅 이벤트

### user.created
새로운 사용자가 Clerk에 생성되었을 때 발생합니다.

**처리 내용:**
- Supabase `auth.users` 테이블에 사용자 생성
- `public.users` 테이블에 자동으로 생성됨 (트리거)
- Clerk 사용자 정보를 Supabase user_metadata에 저장

### user.updated
사용자 정보가 업데이트되었을 때 발생합니다.

**처리 내용:**
- Supabase `auth.users` 테이블의 사용자 정보 업데이트
- user_metadata 업데이트 (이름, 이메일, 프로필 이미지 등)

### user.deleted
사용자가 삭제되었을 때 발생합니다.

**처리 내용:**
- Supabase `auth.users` 테이블에서 사용자 삭제
- `public.users` 테이블에서도 자동으로 삭제됨 (CASCADE)

## 로컬 개발 환경 테스트

로컬 개발 환경에서 웹훅을 테스트하려면:

1. **ngrok** 또는 유사한 터널링 도구 사용:
   ```bash
   ngrok http 3000
   ```

2. ngrok에서 제공하는 URL을 Clerk 웹훅 URL로 설정:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/clerk
   ```

3. Clerk 대시보드에서 테스트 웹훅 전송

## 보안 고려사항

1. **서명 검증**: 모든 웹훅 요청은 자동으로 서명 검증을 거칩니다.
2. **환경 변수 보안**: 
   - `CLERK_WEBHOOK_SECRET`는 절대 공개 저장소에 커밋하지 마세요.
   - `SUPABASE_SERVICE_ROLE_KEY`는 관리자 권한이므로 특히 주의하세요.
3. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요.

## 문제 해결

### 서명 검증 실패 (401 Unauthorized)

- `CLERK_WEBHOOK_SECRET` 환경 변수가 올바르게 설정되었는지 확인
- Clerk 대시보드의 Signing Secret과 일치하는지 확인
- 요청 본문이 원본 그대로 전달되는지 확인 (JSON 파싱 전에 서명 검증)

### 사용자가 동기화되지 않음

- `SUPABASE_SERVICE_ROLE_KEY` 환경 변수가 설정되었는지 확인
- 웹훅 로그 확인 (`logClerkWebhookEvent` 함수의 출력)
- Supabase 데이터베이스 연결 상태 확인
- Supabase Admin API 권한 확인

### 중복 사용자 생성

현재 구현은 이미 존재하는 사용자를 확인하지만, Clerk user ID를 UUID로 변환하는 과정에서 충돌이 발생할 수 있습니다. 필요시 idempotency 키를 추가로 구현할 수 있습니다.

## 참고 자료

- [Clerk 웹훅 문서](https://clerk.com/docs/guides/development/webhooks/overview)
- [Clerk 웹훅 이벤트 목록](https://clerk.com/docs/guides/development/webhooks/events)
- [Supabase Admin API 문서](https://supabase.com/docs/reference/javascript/auth-admin-api)

