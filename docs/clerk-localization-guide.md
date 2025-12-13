# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다. [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 기반으로 작성되었습니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어의 로컬라이제이션을 제공합니다. 이 프로젝트에서는 한국어(ko-KR) 로컬라이제이션이 적용되어 있습니다.

## 설정 완료

프로젝트의 `src/app/layout.tsx` 파일에 한국어 로컬라이제이션이 이미 적용되어 있습니다:

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {/* ... */}
    </ClerkProvider>
  );
}
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

- 한국어 (ko-KR) ✅ **현재 적용됨**
- 영어 (en-US, en-GB)
- 일본어 (ja-JP)
- 중국어 간체 (zh-CN)
- 중국어 번체 (zh-TW)
- 기타 50개 이상의 언어

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)에서 확인할 수 있습니다.

## 커스텀 로컬라이제이션

기본 한국어 번역을 커스터마이징하려면 다음과 같이 설정할 수 있습니다:

```tsx
import { koKR } from '@clerk/localizations';

const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    start: {
      title: '환영합니다',
      subtitle: '{{applicationName}}에 로그인하세요',
    },
  },
  signUp: {
    ...koKR.signUp,
    start: {
      title: '계정 만들기',
      subtitle: '{{applicationName}}에 가입하세요',
    },
  },
};

<ClerkProvider localization={customKoKR}>
  {/* ... */}
</ClerkProvider>
```

## 에러 메시지 커스터마이징

특정 에러 메시지를 커스터마이징하려면 `unstable__errors` 키를 사용할 수 있습니다:

```tsx
import { koKR } from '@clerk/localizations';

const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      '접근 권한이 없습니다. 지원팀에 문의하여 회사 이메일 도메인을 허용 목록에 추가해주세요.',
  },
};

<ClerkProvider localization={customKoKR}>
  {/* ... */}
</ClerkProvider>
```

사용 가능한 모든 에러 키는 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체에서 확인할 수 있습니다.

## 개별 컴포넌트에 로컬라이제이션 적용

전역 설정 외에도 개별 컴포넌트에 로컬라이제이션을 적용할 수 있습니다:

```tsx
import { SignIn, SignUp } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

export default function AuthPage() {
  return (
    <div>
      <SignIn localization={koKR} />
      <SignUp localization={koKR} />
    </div>
  );
}
```

## 주의사항

> ⚠️ **실험적 기능**: 로컬라이제이션 기능은 현재 실험적(experimental) 단계입니다. 예상치 못한 동작이 발생할 수 있으므로, 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

> 📝 **Account Portal**: 로컬라이제이션은 Clerk 컴포넌트에만 적용되며, 호스팅되는 [Clerk Account Portal](https://clerk.com/docs/guides/account-portal/overview)은 여전히 영어로 표시됩니다.

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [영어 로컬라이제이션 파일 (GitHub)](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)

