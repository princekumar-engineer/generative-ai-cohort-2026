import type { HTMLAttributes } from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Props for the {@link Loader} spinner component. */
export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

/** Spinning loading indicator for in-progress assistant responses. */
export const Loader = ({ className, size = 16, ...props }: LoaderProps) => (
  <div
    className={cn("inline-flex items-center justify-center", className)}
    {...props}
  >
    <Loader2Icon className="animate-spin" size={size} />
  </div>
);
