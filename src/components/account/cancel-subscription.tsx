"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Subscription } from "@/lib/types/subscription";
import { formatDate } from "@/lib/utils/date";
import { isSubscriptionActive } from "@/lib/utils/subscription-client";
import { LuLoader, LuCircle } from "react-icons/lu";
import { toast } from "sonner";

interface CancelSubscriptionProps {
  subscription: Subscription | null;
  onCancelSuccess?: () => void;
}

/**
 * 구독 취소 컴포넌트
 */
export function CancelSubscription({
  subscription,
  onCancelSuccess,
}: CancelSubscriptionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  if (!subscription) {
    return null;
  }

  const isActive = isSubscriptionActive(subscription);

  // 이미 취소 예정이거나 취소된 경우
  if (subscription.cancel_at_period_end || subscription.status === "canceled") {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
        <div className="flex items-start gap-3">
          <LuCircle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-orange-900 dark:text-orange-100">
              구독 취소 예정
            </h4>
            <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
              {subscription.status === "canceled"
                ? "구독이 이미 취소되었습니다"
                : `현재 기간 종료일(${formatDate(subscription.current_period_end)})까지 서비스를 이용하실 수 있습니다.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 활성 구독이 아닌 경우 버튼 숨김
  if (!isActive) {
    return null;
  }

  const handleCancel = async () => {
    setIsCanceling(true);

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "구독 취소에 실패했습니다");
      }

      const result = await response.json();
      toast.success("구독이 취소 예정되었습니다", {
        description: `${formatDate(result.current_period_end)}까지 서비스를 이용하실 수 있습니다.`,
      });

      setOpen(false);
      if (onCancelSuccess) {
        onCancelSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error("구독 취소에 실패했습니다", {
        description: error instanceof Error ? error.message : "다시 시도해주세요",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">구독 취소</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>구독을 취소하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            구독을 취소하시면 현재 기간 종료일(
            {formatDate(subscription.current_period_end)})까지는 서비스를 계속 이용하실 수
            있습니다. 기간 종료 후에는 프리미엄 기능을 이용하실 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCanceling}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCanceling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCanceling ? (
              <>
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "구독 취소하기"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

