import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/types/database";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

interface FreePromptsSectionProps {
  prompts: PromptTemplate[];
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

export function FreePromptsSection({ prompts }: FreePromptsSectionProps) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-muted/50">
      <div className="container px-4">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            무료로 체험해보세요
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            지금 바로 사용할 수 있는 무료 프롬프트를 확인해보세요
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2 sm:text-lg">
                    {prompt.title}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="mt-2 w-fit text-xs sm:text-sm">
                  {categoryLabels[prompt.category] || prompt.category}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <CardDescription className="line-clamp-3 text-sm sm:text-base">
                  {prompt.description || prompt.content.slice(0, 100) + "..."}
                </CardDescription>
              </CardContent>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <Button asChild variant="outline" className="w-full min-h-[44px]">
                  <Link href={`/free#${prompt.id}`}>자세히 보기</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center sm:mt-8">
          <Button asChild size="lg" className="min-h-[44px]">
            <Link href="/free">전체 무료 프롬프트 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


