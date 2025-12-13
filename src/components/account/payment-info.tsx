import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/../database.types";
import { formatDate } from "@/lib/utils/date";
import { isSubscriptionActive } from "@/lib/utils/subscription";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface PaymentInfoProps {
  subscription: Subscription | null;
}

/**
 * 결제 정보 표시 컴포넌트
 */
export function PaymentInfo({ subscription }: PaymentInfoProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>결제 정보</CardTitle>
          <CardDescription>구독 정보가 없습니다</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isActive = isSubscriptionActive(subscription);
  const planNameMap: Record<string, string> = {
    monthly_9900: "프리미엄 플랜",
  };

  const planName = planNameMap[subscription.plan_name] || subscription.plan_name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 정보</CardTitle>
        <CardDescription>현재 구독 플랜 및 결제 정보</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">플랜</span>
            <span className="font-medium">{planName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">월 결제 금액</span>
            <span className="font-medium">{subscription.price_krw.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">결제 주기</span>
            <span className="font-medium">매월</span>
          </div>
          {isActive && !subscription.cancel_at_period_end && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">다음 결제일</span>
              <span className="font-medium">
                {formatDate(subscription.current_period_end)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">구독 시작일</span>
            <span className="font-medium">
              {formatDate(subscription.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

