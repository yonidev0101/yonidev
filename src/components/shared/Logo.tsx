import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
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
        <span
          className="font-bold text-heading tracking-tight"
          style={{ fontSize: size === "sm" ? 16 : size === "md" ? 20 : 26 }}
        >
          Yoni<span className="text-brand-500">Dev</span>
        </span>
      )}
    </Link>
  );
}
