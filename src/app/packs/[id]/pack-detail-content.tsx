"use client";

import { useState } from "react";
import { TrendDescriptionSection } from "@/components/packs/trend-description-section";
import { ScrapedItemsSection } from "@/components/packs/scraped-items-section";
import { PackPromptsSection } from "@/components/packs/pack-prompts-section";
import type { Database } from "@/../database.types";
import type { PurposeValue } from "@/components/packs/purpose-selector";

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];
type ScrapedItem = Database["public"]["Tables"]["scraped_items"]["Row"];
type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];
type PackPrompt = Database["public"]["Tables"]["pack_prompts"]["Row"];

interface PackWithPrompts extends PromptTemplate {
  pack_prompts: PackPrompt;
}

interface PackDetailContentProps {
  pack: TrendPack;
  scrapedItems: ScrapedItem[];
  prompts: PackWithPrompts[];
}

export function PackDetailContent({
  pack,
  scrapedItems,
  prompts,
}: PackDetailContentProps) {
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeValue>("all");

  return (
    <div className="space-y-12">
      <TrendDescriptionSection pack={pack} />
      <ScrapedItemsSection items={scrapedItems} />
      <PackPromptsSection
        prompts={prompts}
        packId={pack.id}
        selectedPurpose={selectedPurpose}
        onPurposeChange={setSelectedPurpose}
      />
    </div>
  );
}

