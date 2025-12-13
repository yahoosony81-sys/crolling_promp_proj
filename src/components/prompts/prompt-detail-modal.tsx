"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./copy-button";
import type { Database } from "@/../database.types";

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

interface PromptDetailModalProps {
  prompt: PromptTemplate;
  isOpen: boolean;
  onClose: () => void;
}

async function trackUsage(promptId: string, action: "copy" | "view") {
  try {
    await fetch("/api/prompts/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt_id: promptId,
        action,
      }),
    });
  } catch (error) {
    // 사용 기록 추적 실패는 무시 (비동기 처리)
    console.error("Failed to track usage:", error);
  }
}

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
}: PromptDetailModalProps) {
  // 모달이 열릴 때 사용 기록 추적
  useEffect(() => {
    if (isOpen) {
      trackUsage(prompt.id, "view");
    }
  }, [isOpen, prompt.id]);

  const variables = Array.isArray(prompt.variables) ? prompt.variables : [];
  const exampleInputs =
    typeof prompt.example_inputs === "object" && prompt.example_inputs !== null
      ? prompt.example_inputs
      : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{prompt.title}</DialogTitle>
              <Badge variant="secondary" className="mb-2">
                {categoryLabels[prompt.category] || prompt.category}
              </Badge>
            </div>
          </div>
          {prompt.description && (
            <DialogDescription className="text-base">
              {prompt.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* 프롬프트 내용 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">프롬프트 내용</h3>
            <div className="bg-muted rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {prompt.content}
              </pre>
            </div>
            <div className="mt-4">
              <CopyButton prompt={prompt} />
            </div>
          </div>

          {/* 변수 가이드 */}
          {variables.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">변수 가이드</h3>
              <div className="bg-muted rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {variables.map((variable: string, index: number) => (
                    <li key={index} className="text-sm">
                      {variable}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 예시 입력값 */}
          {Object.keys(exampleInputs).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">예시 입력값</h3>
              <div className="bg-muted rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(exampleInputs, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

