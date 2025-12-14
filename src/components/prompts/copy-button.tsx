"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LuCopy, LuCheck } from "react-icons/lu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/database";
import { createPromptWithVariables } from "@/lib/utils/prompt";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

interface CopyButtonProps {
  prompt: PromptTemplate;
  packId?: string;
}

async function trackUsage(promptId: string, action: "copy" | "view", packId?: string) {
  try {
    await fetch("/api/prompts/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt_id: promptId,
        pack_id: packId,
        action,
      }),
    });
  } catch (error) {
    // 사용 기록 추적 실패는 무시 (비동기 처리)
    console.error("Failed to track usage:", error);
  }
}

export function CopyButton({ prompt, packId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // example_inputs가 있으면 변수 치환된 프롬프트를 복사, 없으면 원본 복사
      const contentToCopy = createPromptWithVariables(
        prompt.content,
        prompt.example_inputs
      );
      
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      toast.success("프롬프트가 복사되었습니다");
      
      // 사용 기록 추적 (비동기)
      await trackUsage(prompt.id, "copy", packId);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("복사에 실패했습니다");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-2 min-h-[36px] transition-all duration-200",
        copied && "bg-primary text-primary-foreground"
      )}
      aria-label={copied ? "복사됨" : "프롬프트 복사"}
    >
      {copied ? (
        <>
          <LuCheck className="size-4 animate-in fade-in-0 duration-200" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <LuCopy className="size-4" />
          <span>복사</span>
        </>
      )}
    </Button>
  );
}

