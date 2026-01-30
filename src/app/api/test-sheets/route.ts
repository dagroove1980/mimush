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

  // Test the connection - use POST like the actual API does
  try {
    const testUrl = `${SHEETS_URL}?action=test`;
    const res = await fetch(testUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "MerkazMiyum/1.0"
      },
      body: JSON.stringify({ action: "test" }),
      redirect: "follow",
    });
    const text = await res.text();
    
    // Check if we got HTML (sign-in page) instead of JSON
    const isHtml = text.trim().toLowerCase().startsWith("<!doctype") || 
                   text.includes("<html") || 
                   text.includes("accounts.google.com");
    
    return NextResponse.json({
      success: !isHtml,
      status: res.status,
      statusText: res.statusText,
      isHtml: isHtml,
      responsePreview: text.substring(0, 500),
      responseType: isHtml ? "HTML (sign-in page)" : "JSON",
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
