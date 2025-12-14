import { LuLoader } from "react-icons/lu"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.ComponentProps<"svg"> {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <LuLoader
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", sizeMap[size], className)}
      {...props}
    />
  )
}

export { Spinner }
