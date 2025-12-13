"use client";

import { useMemo } from "react";
import { PromptCard } from "./prompt-card";
import type { CategoryFilterValue } from "./category-filter";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { Database } from "@/../database.types";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

interface PromptListProps {
  prompts: PromptTemplate[];
  selectedCategory: CategoryFilterValue;
}

export function PromptList({ prompts, selectedCategory }: PromptListProps) {
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "all") {
      return prompts;
    }
    return prompts.filter((prompt) => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  return (
    <div>
      {filteredPrompts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>프롬프트가 없습니다</EmptyTitle>
            <EmptyDescription>
              선택한 카테고리에 해당하는 프롬프트가 없습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}

