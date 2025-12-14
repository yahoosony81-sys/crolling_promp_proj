"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PurposeValue = "all" | "analysis" | "content" | "sales" | "investment";

const purposes: Array<{ value: PurposeValue; label: string }> = [
  { value: "all", label: "전체" },
  { value: "analysis", label: "분석" },
  { value: "content", label: "콘텐츠 제작" },
  { value: "sales", label: "판매" },
  { value: "investment", label: "투자" },
];

interface PurposeSelectorProps {
  selectedPurpose: PurposeValue;
  onPurposeChange: (purpose: PurposeValue) => void;
}

export function PurposeSelector({
  selectedPurpose,
  onPurposeChange,
}: PurposeSelectorProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="mb-3 text-xl font-bold tracking-tight sm:mb-4 sm:text-2xl">
        목적별 프롬프트
      </h2>
      <div 
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        role="tablist"
        aria-label="목적 선택"
      >
        {purposes.map((purpose) => (
          <Button
            key={purpose.value}
            variant={selectedPurpose === purpose.value ? "default" : "outline"}
            onClick={() => onPurposeChange(purpose.value)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap min-h-[44px] text-sm sm:text-base",
              selectedPurpose === purpose.value && "bg-primary text-primary-foreground"
            )}
            role="tab"
            aria-selected={selectedPurpose === purpose.value}
            aria-controls={`purpose-${purpose.value}`}
          >
            {purpose.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

