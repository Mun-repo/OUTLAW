import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  imgClassName?: string;
};

export function Logo({ className, imgClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/logo-outlaw.png"
        alt="Outlaw"
        className={cn(imgClassName ?? "h-8 w-auto md:h-9")}
      />
    </span>
  );
}
