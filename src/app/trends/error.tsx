"use client";

import { TrendsError } from "@/components/trends/trends-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <TrendsError error={error} reset={reset} />;
}

