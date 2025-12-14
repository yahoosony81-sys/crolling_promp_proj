import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Subscription } from "@/lib/types/subscription";
import {
  getSubscriptionStatusLabel,
  getSubscriptionStatusVariant,
  isSubscriptionActive,
} from "@/lib/utils/subscription";
import { formatSubscriptionPeriod, formatDate } from "@/lib/utils/date";

interface SubscriptionStatusProps {
  subscription: Subscription | null;
}

/**
 * 구독 상태 표시 컴포넌트
 */
export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const statusLabel = getSubscriptionStatusLabel(subscription);
  const statusVariant = getSubscriptionStatusVariant(subscription);
  const isActive = subscription ? isSubscriptionActive(subscription) : false;

  // 구독이 없는 경우
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>구독 상태</CardTitle>
          <CardDescription>현재 활성 구독이 없습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Badge variant="outline">구독 없음</Badge>
            <div>
              <Button asChild>
                <Link href="/pricing">구독하기</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>구독 상태</CardTitle>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        <CardDescription>
          {subscription.cancel_at_period_end
            ? "현재 기간 종료 시 구독이 취소됩니다"
            : isActive
            ? "구독이 활성 상태입니다"
            : "구독이 만료되었습니다"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">구독 기간</span>
            <span className="font-medium">
              {formatSubscriptionPeriod(
                subscription.current_period_start,
                subscription.current_period_end
              )}
            </span>
          </div>
          {isActive && !subscription.cancel_at_period_end && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">다음 결제일</span>
              <span className="font-medium">
                {formatDate(subscription.current_period_end)}
              </span>
            </div>
          )}
          {subscription.cancel_at_period_end && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">서비스 이용 가능 기간</span>
              <span className="font-medium text-orange-600">
                {formatDate(subscription.current_period_end)}까지
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

