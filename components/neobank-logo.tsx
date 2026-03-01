import { cn } from "@/lib/utils"

export function NeoBankLogo({ className, size = "default" }: { className?: string; size?: "sm" | "default" | "lg" }) {
  const sizeMap = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }
  const textSize = {
    sm: "text-base",
    default: "text-xl",
    lg: "text-3xl",
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative rounded-lg bg-primary flex items-center justify-center", sizeMap[size])}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[60%] w-[60%]"
          aria-hidden="true"
        >
          <path
            d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary-foreground"
          />
          <path
            d="M12 8v8M8 12h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-primary-foreground"
          />
        </svg>
      </div>
      <span className={cn("font-semibold tracking-tight text-foreground", textSize[size])}>
        NeoBank
      </span>
    </div>
  )
}
