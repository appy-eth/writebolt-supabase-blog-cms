import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Blog Post";
  const author = searchParams.get("author") || "";
  const category = searchParams.get("category") || "";
  const blogName = searchParams.get("blog") || "Writebolt Blog";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "24px",
              fontWeight: 700,
              color: "#2563EB",
            }}
          >
            <span>⚡</span>
            <span>{blogName}</span>
          </div>
          {category && (
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#2563EB",
                backgroundColor: "#EFF6FF",
                padding: "6px 16px",
                borderRadius: "9999px",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "48px" : "56px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
          {author && (
            <p
              style={{
                fontSize: "22px",
                color: "#6B7280",
                margin: 0,
              }}
            >
              by {author}
            </p>
          )}
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            height: "6px",
            width: "100%",
            background: "linear-gradient(to right, #2563EB, #7C3AED)",
            borderRadius: "3px",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
