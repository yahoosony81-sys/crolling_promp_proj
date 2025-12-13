import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const differentiators = [
  {
    title: "매주 업데이트되는 트렌드 반영",
    description:
      "주 1~2회 자동 크롤링으로 최신 트렌드를 수집하고, 이를 프롬프트에 반영합니다. 항상 최신 정보로 작업하세요.",
  },
  {
    title: "자동 크롤링·스크래핑 데이터",
    description:
      "수동으로 정보를 수집할 필요 없이, 자동으로 수집된 데이터를 기반으로 프롬프트를 제공합니다.",
  },
  {
    title: "목적별 맞춤 프롬프트 제공",
    description:
      "분석, 콘텐츠 제작, 판매, 투자 등 목적에 맞는 프롬프트를 제공하여 즉시 실행 가능합니다.",
  },
  {
    title: "즉시 실행 가능한 실행형 프롬프트",
    description:
      "복사해서 바로 사용할 수 있는 실행형 프롬프트로, 시간을 절약하고 빠르게 결과물을 만들어보세요.",
  },
];

export function DifferentiatorsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            왜 TrendScrape Prompt인가요?
          </h2>
          <p className="text-lg text-muted-foreground">
            기존 프롬프트 서비스와는 다른 차별화된 경험을 제공합니다
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {differentiators.map((item, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

