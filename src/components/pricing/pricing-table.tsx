"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING_FEATURES, FREE_PLAN, PREMIUM_PLAN } from "@/lib/constants/pricing";
import { LuCheck, LuX } from "react-icons/lu";
import { cn } from "@/lib/utils";

/**
 * 기능 비교 테이블 컴포넌트
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시
 */
export function PricingTable() {
  return (
    <>
      {/* 데스크톱 테이블 (md 이상) */}
      <div className="hidden md:block">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              기능 비교
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">기능</TableHead>
                  <TableHead className="text-center">무료</TableHead>
                  <TableHead className="text-center">프리미엄</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRICING_FEATURES.map((feature) => {
                  const hasFree = FREE_PLAN.featuresMap[feature.id];
                  const hasPremium = PREMIUM_PLAN.featuresMap[feature.id];

                  return (
                    <TableRow key={feature.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{feature.name}</div>
                          {feature.description && (
                            <div className="text-sm text-muted-foreground">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {hasFree ? (
                          <LuCheck className="mx-auto h-5 w-5 text-primary" />
                        ) : (
                          <LuX className="mx-auto h-5 w-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasPremium ? (
                          <LuCheck className="mx-auto h-5 w-5 text-primary" />
                        ) : (
                          <LuX className="mx-auto h-5 w-5 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 모바일 카드 형태 (md 미만) */}
      <div className="space-y-6 md:hidden">
        {/* 무료 플랜 카드 */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">무료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {PRICING_FEATURES.map((feature) => {
              const hasFeature = FREE_PLAN.featuresMap[feature.id];
              return (
                <div
                  key={feature.id}
                  className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5 shrink-0">
                    {hasFeature ? (
                      <LuCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <LuX className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{feature.name}</div>
                    {feature.description && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {feature.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 프리미엄 플랜 카드 */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-xl font-bold">프리미엄</CardTitle>
            <div className="text-2xl font-bold text-primary">월 9,900원</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {PRICING_FEATURES.map((feature) => {
              const hasFeature = PREMIUM_PLAN.featuresMap[feature.id];
              return (
                <div
                  key={feature.id}
                  className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5 shrink-0">
                    {hasFeature ? (
                      <LuCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <LuX className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{feature.name}</div>
                    {feature.description && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {feature.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

