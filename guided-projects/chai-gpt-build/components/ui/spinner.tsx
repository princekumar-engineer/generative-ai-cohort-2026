import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

/** Animated loading spinner icon for async operations. */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
