import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-secondary/40 px-3 py-2 text-base text-foreground shadow-none outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground md:text-sm",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "file:mr-3 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
