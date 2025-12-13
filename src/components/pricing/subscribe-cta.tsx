"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkSubscription } from "@/lib/utils/subscription";
import { LuLoader2 } from "react-icons/lu";

/**
 * 구독 CTA 컴포넌트
 * - 로그인 안 된 경우: 로그인 유도
 * - 로그인된 경우: 구독 상태 확인 후 구독 버튼 표시
 */
export function SubscribeCTA() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function checkUserSubscription() {
      if (!isLoaded || !isSignedIn || !user?.id) {
        setHasSubscription(null);
        return;
      }

      setIsChecking(true);
      try {
        const subscribed = await checkSubscription(user.id);
        setHasSubscription(subscribed);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasSubscription(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkUserSubscription();
  }, [isLoaded, isSignedIn, user?.id]);

  // 로딩 중
  if (!isLoaded || isChecking) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center py-8">
          <LuLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // 로그인 안 된 경우
  if (!isSignedIn) {
    return (
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="mb-2 text-2xl font-bold">
            구독을 시작하려면 로그인이 필요합니다
          </CardTitle>
          <CardDescription className="text-base">
            로그인 후 프리미엄 플랜을 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login?redirect=/pricing">로그인하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/free">무료 프롬프트 먼저 보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 이미 구독 중인 경우
  if (hasSubscription === true) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="mb-2 text-2xl font-bold text-primary">
            이미 구독 중입니다
          </CardTitle>
          <CardDescription className="text-base">
            프리미엄 플랜의 모든 기능을 이용하실 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/trends">트렌드 패키지 보기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/account">내 계정 관리</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 구독 안 된 경우 - 구독 버튼 표시
  return (
    <Card className="border-2 border-primary">
      <CardHeader className="text-center">
        <CardTitle className="mb-2 text-2xl font-bold">
          지금 바로 구독하세요
        </CardTitle>
        <CardDescription className="text-base">
          월 9,900원으로 매주 업데이트되는 트렌드 프롬프트를 이용하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              router.push("/checkout");
            }}
          >
            구독하기
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/free">무료 프롬프트 먼저 보기</Link>
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          언제든지 취소할 수 있습니다
        </p>
      </CardContent>
    </Card>
  );
}

