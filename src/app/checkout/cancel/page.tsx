import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LuXCircle } from "react-icons/lu";

export const dynamic = "force-dynamic";

/**
 * 결제 취소 페이지
 * 
 * 카드 등록이 취소되었을 때 표시되는 페이지입니다.
 */
export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <LuXCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">결제가 취소되었습니다</CardTitle>
            <CardDescription>
              카드 등록이 취소되었습니다. 언제든지 다시 시도하실 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              궁금한 점이 있으시면 고객센터로 문의해주세요.
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/pricing">구독 페이지로 돌아가기</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/checkout">다시 시도</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

