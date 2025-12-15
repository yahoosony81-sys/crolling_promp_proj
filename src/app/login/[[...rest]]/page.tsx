"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/sign-up"
        afterSignInUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}



