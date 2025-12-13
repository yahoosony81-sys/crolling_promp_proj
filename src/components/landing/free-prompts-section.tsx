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
import type { Database } from "@/../database.types";

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
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            무료로 체험해보세요
          </h2>
          <p className="text-lg text-muted-foreground">
            지금 바로 사용할 수 있는 무료 프롬프트를 확인해보세요
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {prompt.title}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="mt-2 w-fit">
                  {categoryLabels[prompt.category] || prompt.category}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="line-clamp-3">
                  {prompt.description || prompt.content.slice(0, 100) + "..."}
                </CardDescription>
              </CardContent>
              <div className="px-6 pb-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/free#${prompt.id}`}>자세히 보기</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link href="/free">전체 무료 프롬프트 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

