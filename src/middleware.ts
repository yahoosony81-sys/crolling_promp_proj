import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// 인증이 필요한 경로
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/trends(.*)",
  "/packs(.*)",
  "/account(.*)",
]);

// 인증된 사용자가 접근하면 안 되는 경로
const isAuthRoute = createRouteMatcher(["/login(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth();
  const pathname = request.nextUrl.pathname;

  // 보호된 라우트 접근 시 인증 체크
  if (isProtectedRoute(request) && !userId) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 인증된 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if (isAuthRoute(request) && userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 응답 생성
  const response = NextResponse.next();

  // 보안 헤더 추가
  // CORS 정책 설정
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean) as string[];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  // SameSite 쿠키 설정은 Next.js가 자동으로 처리하지만,
  // 명시적으로 설정할 수도 있습니다.
  // response.headers.set("Set-Cookie", "SameSite=Strict");

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
