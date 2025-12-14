"use client";

import { useMemo } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { PackPromptCard } from "./pack-prompt-card";
import { PurposeSelector, type PurposeValue } from "./purpose-selector";
import type { Database } from "@/lib/types/database";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];
type PackPrompt = Database["public"]["Tables"]["pack_prompts"]["Row"];

type PackWithPrompts = PromptTemplate & { pack_prompts: PackPrompt };

interface PackPromptsSectionProps {
  prompts: PackWithPrompts[];
  packId: string;
  selectedPurpose: PurposeValue;
  onPurposeChange: (purpose: PurposeValue) => void;
}

// 목적별 카테고리 매핑
const purposeCategoryMap: Record<PurposeValue, string[]> = {
  all: [],
  analysis: ["trend", "stock", "real_estate"],
  content: ["blog", "shorts", "reels"],
  sales: ["product"],
  investment: ["stock", "real_estate"],
};

export function PackPromptsSection({
  prompts,
  packId,
  selectedPurpose,
  onPurposeChange,
}: PackPromptsSectionProps) {
  const filteredPrompts = useMemo(() => {
    if (selectedPurpose === "all") {
      return prompts;
    }

    const allowedCategories = purposeCategoryMap[selectedPurpose];
    return prompts.filter((prompt) =>
      allowedCategories.includes(prompt.category)
    );
  }, [prompts, selectedPurpose]);

  return (
    <section className="mb-12">
      <PurposeSelector
        selectedPurpose={selectedPurpose}
        onPurposeChange={onPurposeChange}
      />
      
      {filteredPrompts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>프롬프트가 없습니다</EmptyTitle>
            <EmptyDescription>
              선택한 목적에 해당하는 프롬프트가 없습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PackPromptCard key={prompt.id} prompt={prompt} packId={packId} />
          ))}
        </div>
      )}
    </section>
  );
}

