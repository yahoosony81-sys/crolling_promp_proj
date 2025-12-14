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
import { CopyButton } from "@/components/prompts/copy-button";
import type { Database } from "@/lib/types/database";

// PromptDetailModal을 동적 임포트하여 모달이 열릴 때만 로드
const PromptDetailModal = dynamic(
  () => import("@/components/prompts/prompt-detail-modal").then((mod) => ({ default: mod.PromptDetailModal })),
  { ssr: false }
);

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];
type PackPrompt = Database["public"]["Tables"]["pack_prompts"]["Row"];

interface PackPromptCardProps {
  prompt: PromptTemplate & { pack_prompts: PackPrompt };
  packId: string;
}

const categoryLabels: Record<string, string> = {
  blog: "블로그",
  shorts: "숏츠",
  reels: "릴스",
  product: "상품",
  real_estate: "부동산",
  stock: "주식",
  trend: "트렌드",
};

export function PackPromptCard({ prompt, packId }: PackPromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="mt-2 w-fit">
            {categoryLabels[prompt.category] || prompt.category}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1">
          <CardDescription className="line-clamp-3 mb-4">
            {prompt.description || prompt.content.slice(0, 150) + "..."}
          </CardDescription>
          <div className="flex gap-2">
            <CopyButton prompt={prompt} packId={packId} />
            <Button
              variant="outline"
              className="flex-1"
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

