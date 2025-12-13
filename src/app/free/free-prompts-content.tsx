"use client";

import { useState } from "react";
import { CategoryFilter, type CategoryFilterValue } from "@/components/prompts/category-filter";
import { UpgradeCTA } from "@/components/prompts/upgrade-cta";
import { PromptList } from "@/components/prompts/prompt-list";
import { ExamplePromptSection } from "@/components/prompts/example-prompt-section";
import type { Database } from "@/../database.types";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

interface FreePromptsContentProps {
  prompts: PromptTemplate[];
}

export function FreePromptsContent({ prompts }: FreePromptsContentProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterValue>("all");

  return (
    <>
      <div className="mb-8">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        {(selectedCategory === "shorts" || selectedCategory === "reels") && (
          <div className="mt-4">
            <ExamplePromptSection
              selectedCategory={selectedCategory as "shorts" | "reels"}
            />
          </div>
        )}
      </div>
      <UpgradeCTA />
      <div className="mt-8">
        <PromptList prompts={prompts} selectedCategory={selectedCategory} />
      </div>
    </>
  );
}

