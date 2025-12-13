"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LuCopy, LuCheck } from "react-icons/lu";
import { toast } from "sonner";
import type { Database } from "@/../database.types";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

interface CopyButtonProps {
  prompt: PromptTemplate;
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

export function CopyButton({ prompt }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast.success("프롬프트가 복사되었습니다");
      
      // 사용 기록 추적 (비동기)
      await trackUsage(prompt.id, "copy");

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
  );
}

