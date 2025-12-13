import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 결제 내역 섹션 컴포넌트
 * 
 * TODO: 결제 프로바이더 연동 후 구현 예정
 * - Stripe: 결제 내역 조회 API 연동 필요
 * - Toss Payments: 결제 내역 조회 API 연동 필요
 * 
 * 현재는 구조만 준비되어 있으며, 실제 결제 내역 조회는 나중에 구현 예정입니다.
 */
export function PaymentHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 내역</CardTitle>
        <CardDescription>결제 내역을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            결제 내역 기능은 결제 프로바이더 연동 후 제공될 예정입니다
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            현재는 구독 정보에서 결제 정보를 확인하실 수 있습니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

