"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import type { Database } from "@/lib/types/database";

// PromptDetailModal을 동적 임포트하여 모달이 열릴 때만 로드
const PromptDetailModal = dynamic(
  () => import("./prompt-detail-modal").then((mod) => ({ default: mod.PromptDetailModal })),
  { ssr: false }
);

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

const categoryLabels: Record<string, string> = {
  blog: "블로그",
  shorts: "숏츠",
  reels: "릴스",
  product: "상품",
  real_estate: "부동산",
  stock: "주식",
  trend: "트렌드",
};

interface PromptCardProps {
  prompt: PromptTemplate;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2 sm:text-lg">{prompt.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="mt-2 w-fit text-xs sm:text-sm">
            {categoryLabels[prompt.category] || prompt.category}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <CardDescription className="line-clamp-3 mb-4 text-sm leading-relaxed sm:text-base">
            {prompt.description || prompt.content.slice(0, 150) + "..."}
          </CardDescription>
          <div className="flex flex-col gap-2 sm:flex-row">
            <CopyButton prompt={prompt} />
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => setIsModalOpen(true)}
            >
              자세히 보기
            </Button>
          </div>
        </CardContent>
      </Card>
      <PromptDetailModal
        prompt={prompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}


