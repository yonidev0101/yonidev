import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  /** Small caption rendered under the YoniDev wordmark, e.g. "by STARTOP". */
  subtitle?: string;
}

export default function Logo({ size = "md", showText = true, subtitle }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const px = sizes[size];

  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <Image
        src="/logo/y-logo.png"
        alt="YoniDev logo"
        width={px}
        height={px}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="flex flex-col leading-tight">
          <span
            className="font-bold text-heading tracking-tight"
            style={{ fontSize: size === "sm" ? 16 : size === "md" ? 20 : 26 }}
          >
            Yoni<span className="text-brand-500">Dev</span>
          </span>
          {subtitle && (
            <span
              className="font-semibold text-muted-text uppercase mt-0.5"
              style={{ fontSize: 10, letterSpacing: "0.14em" }}
              dir="ltr"
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
