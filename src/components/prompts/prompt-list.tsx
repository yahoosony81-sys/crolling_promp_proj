"use client";

import { useState, useMemo } from "react";
import { PromptCard } from "./prompt-card";
import { CategoryFilter, type CategoryFilterValue } from "./category-filter";
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
}

export function PromptList({ prompts }: PromptListProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterValue>("all");

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "all") {
      return prompts;
    }
    return prompts.filter((prompt) => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  return (
    <div>
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
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

