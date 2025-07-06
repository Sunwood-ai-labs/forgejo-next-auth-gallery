import { NextResponse } from "next/server";

// GET /api/proxy-raw-yaml?url=...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl || !/^https?:\/\/.+/.test(targetUrl)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // 認証が必要な場合はここで付与（必要なら拡張）
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: res.status });
    }
    const text = await res.text();
    // YAMLはtext/plainで返す
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
