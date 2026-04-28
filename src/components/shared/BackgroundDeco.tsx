/**
 * Reusable, decorative background pieces.
 * All are absolutely positioned, pointer-events-none and aria-hidden.
 * Combine inside a `relative overflow-hidden` parent.
 */

interface BlobProps {
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
}

export function RadialBlob({
  className = "",
  size = 500,
  color = "#2B7FFF",
  opacity = 0.08,
}: BlobProps) {
  return (
    <div
      aria-hidden
      className={`absolute rounded-full pointer-events-none blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

export function DotGrid({
  className = "",
  opacity = 0.04,
  size = 32,
}: {
  className?: string;
  opacity?: number;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, #0F172A 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
    />
  );
}

/** Subtle flowing parallel curves — used near nav arrows in projects, etc. */
export function FlowingCurves({
  className = "",
  width = 800,
  height = 280,
  opacity = 0.5,
}: {
  className?: string;
  width?: number;
  height?: number;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden
      className={`absolute pointer-events-none ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="flowingCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="#2B7FFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#2B7FFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2B7FFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M0,${200 + i * 20} C200,${140 + i * 20} 400,${260 + i * 20} 600,${180 + i * 20} S 900,${200 + i * 20} 900,${200 + i * 20}`}
          stroke="url(#flowingCurveGrad)"
          strokeWidth="1"
          fill="none"
        />
      ))}
    </svg>
  );
}

/** Big organic blob shape — for between-section transitions */
export function OrganicShape({
  className = "",
  flip = false,
  opacity = 0.5,
}: {
  className?: string;
  flip?: boolean;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 600 600"
      style={{ opacity, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <radialGradient id="organicGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#2B7FFF" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#2B7FFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#2B7FFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M300,80 C420,80 540,180 540,320 C540,460 420,540 280,520 C140,500 60,400 80,260 C100,140 180,80 300,80 Z"
        fill="url(#organicGrad)"
      />
    </svg>
  );
}
