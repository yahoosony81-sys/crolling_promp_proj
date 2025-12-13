"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LuCopy, LuCheck } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const examplePrompts = {
  shorts: {
    title: "숏츠 훅 문장 생성 프롬프트",
    category: "shorts",
    content: `2024년 12월 트렌드를 활용해서 숏츠에 쓸 훅 문장 10개 만들어줘.

조건:
- 1초 안에 시선 끌 수 있는 문장
- 숫자, 질문형, 공감형 섞기`,
    description: "2024년 12월 트렌드를 활용한 숏츠 훅 문장 생성 예시",
  },
  reels: {
    title: "릴스 훅 문장 생성 프롬프트",
    category: "reels",
    content: `2024년 12월 트렌드를 활용해서 릴스에 쓸 훅 문장 10개 만들어줘.

조건:
- 1초 안에 시선 끌 수 있는 문장
- 숫자, 질문형, 공감형 섞기`,
    description: "2024년 12월 트렌드를 활용한 릴스 훅 문장 생성 예시",
  },
};

interface ExamplePromptSectionProps {
  selectedCategory: "shorts" | "reels" | null;
}

export function ExamplePromptSection({
  selectedCategory,
}: ExamplePromptSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const examplePrompt =
    selectedCategory && examplePrompts[selectedCategory]
      ? examplePrompts[selectedCategory]
      : null;

  const handleCopy = async () => {
    if (!examplePrompt) return;
    try {
      await navigator.clipboard.writeText(examplePrompt.content);
      setCopied(true);
      toast.success("프롬프트가 복사되었습니다");
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("복사에 실패했습니다");
      console.error("Failed to copy:", error);
    }
  };

  if (!examplePrompt) {
    return null;
  }

  return (
    <>
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-primary/50 bg-muted/30 p-6 transition-colors hover:bg-muted/50"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {examplePrompt.title}
            </h3>
            <Badge variant="secondary" className="mb-2">
              {selectedCategory === "shorts" ? "숏츠" : "릴스"}
            </Badge>
            {examplePrompt.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {examplePrompt.description}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm">
            자세히 보기
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">
                  {examplePrompt.title}
                </DialogTitle>
                <Badge variant="secondary" className="mb-2">
                  {selectedCategory === "shorts" ? "숏츠" : "릴스"}
                </Badge>
              </div>
            </div>
            {examplePrompt.description && (
              <DialogDescription className="text-base">
                {examplePrompt.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {/* 프롬프트 내용 */}
            <div>
              <h3 className="text-lg font-semibold mb-2">프롬프트 내용</h3>
              <div className="bg-muted rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {examplePrompt.content}
                </pre>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <LuCheck className="size-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <LuCopy className="size-4" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

