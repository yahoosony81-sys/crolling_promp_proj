"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// UserProfile을 동적 임포트하여 초기 번들 크기 감소
const UserProfile = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.UserProfile })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login?redirect=/profile");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
          프로필 관리
        </h1>
        <p className="text-lg text-muted-foreground">
          계정 정보를 수정하고 관리하세요
        </p>
      </div>
      <div className="flex justify-center">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full max-w-4xl",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}

