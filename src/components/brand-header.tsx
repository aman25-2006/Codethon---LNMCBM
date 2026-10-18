import Image from "next/image";
import Link from "next/link";

interface BrandHeaderProps {
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

export function BrandHeader({
  subtitle = "College Coding Competition Portal",
  size = "md",
  centered = false,
}: BrandHeaderProps) {
  const logoDimensions = {
    sm: { width: 42, height: 42, text: "text-base", subText: "text-xs" },
    md: { width: 56, height: 56, text: "text-lg md:text-xl", subText: "text-xs md:text-sm" },
    lg: { width: 76, height: 76, text: "text-xl md:text-2xl", subText: "text-sm md:text-base" },
  };

  const dim = logoDimensions[size];

  return (
    <div className={`flex items-center gap-3.5 ${centered ? "justify-center text-center flex-col md:flex-row" : ""}`}>
      <Link href="/" className="flex-shrink-0 relative group">
        <div className="relative overflow-hidden rounded-full border-2 border-blue-900/10 p-0.5 bg-white shadow-sm transition-transform group-hover:scale-105">
          <Image
            src="/images/college-logo.png"
            alt="Lalit Narayan Mishra College of Business Management Logo"
            width={dim.width}
            height={dim.height}
            className="object-contain"
            priority
          />
        </div>
      </Link>
      <div className={centered ? "text-center md:text-left" : "text-left"}>
        <h1 className={`font-bold tracking-tight text-slate-900 leading-tight ${dim.text}`}>
          Lalit Narayan Mishra College of Business Management
        </h1>
        <p className={`font-medium text-blue-700 tracking-wide uppercase ${dim.subText}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

