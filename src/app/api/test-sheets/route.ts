import { NextRequest, NextResponse } from "next/server";

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_APP_URL || "";

export async function GET(request: NextRequest) {
  const info = {
    hasUrl: !!SHEETS_URL,
    urlPrefix: SHEETS_URL ? SHEETS_URL.substring(0, 50) + "..." : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
  };

  if (!SHEETS_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_SHEETS_APP_URL is not set", ...info });
  }

  // Test the connection
  try {
    const testUrl = `${SHEETS_URL}?action=test`;
    const res = await fetch(testUrl, {
      method: "GET",
      redirect: "follow",
    });
    const text = await res.text();
    return NextResponse.json({
      success: true,
      status: res.status,
      statusText: res.statusText,
      responsePreview: text.substring(0, 500),
      ...info,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
      ...info,
    });
  }
}
