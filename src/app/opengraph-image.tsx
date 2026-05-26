import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "YoniDev — Code Your Dream";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(
    join(process.cwd(), "public/logo/y-logo.png"),
    "base64"
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          backgroundImage: [
            // Soft brand halo, upper-right
            "radial-gradient(ellipse 800px 600px at 78% 18%, rgba(43,127,255,0.14), transparent 65%)",
            // Subtle secondary halo, lower-left
            "radial-gradient(ellipse 600px 500px at 12% 95%, rgba(43,127,255,0.08), transparent 60%)",
            // Dot grid
            "radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "auto, auto, 28px 28px",
          fontFamily: "sans-serif",
          padding: "72px 88px",
        }}
      >
        {/* Top bar — brand mark + url */}
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 88,
            right: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#64748B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#2B7FFF",
                boxShadow: "0 0 0 6px rgba(43,127,255,0.12)",
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: "#2B7FFF",
                textTransform: "uppercase",
              }}
            >
              YoniDev
            </span>
          </div>
          <span style={{ fontSize: 18, color: "#94A3B8", letterSpacing: "0.05em" }}>
            yonidev.dev
          </span>
        </div>

        {/* Left — text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 700,
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: 124,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              color: "#0F172A",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Code</span>
            <span style={{ display: "flex" }}>
              <span>Your </span>
              <span
                style={{
                  marginLeft: 24,
                  backgroundImage:
                    "linear-gradient(90deg, #2B7FFF 0%, #60a5fa 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Dream.
              </span>
            </span>
          </div>

          <div
            style={{
              marginTop: 36,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#64748B",
              maxWidth: 620,
            }}
          >
            Full-Stack engineering, AI integrations &amp; automation — from idea to production.
          </div>

          <div
            style={{
              marginTop: 44,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 20,
              color: "#0F172A",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#22C55E",
                boxShadow: "0 0 0 6px rgba(34,197,94,0.18)",
              }}
            />
            <span>Available for work</span>
          </div>
        </div>

        {/* Right — Y logo with soft halo */}
        <div
          style={{
            position: "absolute",
            right: 110,
            top: 0,
            bottom: 0,
            width: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(43,127,255,0.28) 0%, rgba(43,127,255,0) 70%)",
            }}
          />
          <img
            src={logoSrc}
            width={280}
            height={280}
            style={{ display: "block" }}
          />
        </div>

        {/* Hairline bottom accent */}
        <div
          style={{
            position: "absolute",
            left: 88,
            right: 88,
            bottom: 56,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(43,127,255,0) 0%, rgba(43,127,255,0.35) 20%, rgba(43,127,255,0.35) 80%, rgba(43,127,255,0) 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
