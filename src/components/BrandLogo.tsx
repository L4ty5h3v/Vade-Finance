import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  className?: string;
};

const sizeMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

export default function BrandLogo({ href, size = "md", theme = "light", className = "" }: BrandLogoProps) {
  const markTone = theme === "dark" ? "from-[#77ccff] to-[#4a8fff]" : "from-[#35b8ff] to-[#2a6eff]";
  const wordTone = theme === "dark"
    ? "from-[#9cdfff] via-[#70c7ff] to-[#7b9fff]"
    : "from-[#2f97ff] via-[#3faeff] to-[#486ff2]";

  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`relative h-6 w-6 rounded-[8px] bg-gradient-to-br ${markTone} shadow-[0_8px_20px_rgba(49,134,255,0.28)]`}>
        <span className="absolute left-1.5 top-1.5 h-3 w-3 rounded-[4px] border border-white/55 bg-white/70" />
      </span>
      <span className={`${sizeMap[size]} select-none font-semibold lowercase tracking-[-0.025em] text-transparent bg-clip-text bg-gradient-to-r ${wordTone}`}>
        vade
      </span>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
