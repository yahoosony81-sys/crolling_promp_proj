import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="size-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="mb-2 text-4xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            요청하신 페이지를 찾을 수 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
            <br />
            아래 링크를 통해 원하는 페이지로 이동해주세요.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 size-4" />
                홈으로
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/free">
                무료 프롬프트
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/trends">
                트렌드 패키지
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 size-4" />
              이전 페이지
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

