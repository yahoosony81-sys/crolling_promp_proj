"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/login"
        afterSignUpUrl={redirectUrl}
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



