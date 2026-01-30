import { NextRequest, NextResponse } from "next/server";

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_APP_URL || "";

export async function POST(request: NextRequest) {
  if (!SHEETS_URL) {
    console.error("[API] NEXT_PUBLIC_SHEETS_APP_URL is not set");
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SHEETS_APP_URL is not set" },
      { status: 500 }
    );
  }
  try {
    const body = await request.json();
    const { action, ...rest } = body;
    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }
    const url = `${SHEETS_URL}?action=${encodeURIComponent(action)}`;
    console.log("[API] Calling:", url.substring(0, 100) + "...");
    console.log("[API] Action:", action);
    
    // Google Apps Script Web Apps sometimes block server-side requests
    // Try with minimal headers first, then fallback
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...rest }),
      redirect: "follow",
      // Don't send cookies or credentials
      credentials: "omit",
    });
    
    const text = await res.text();
    console.log("[API] Response status:", res.status);
    console.log("[API] Response text length:", text.length);
    
    // Check if we got HTML instead of JSON (sign-in page or error page)
    const isHtml = text.trim().toLowerCase().startsWith("<!doctype") || 
                   text.includes("<html") || 
                   text.includes("accounts.google.com") ||
                   text.includes("Error</title>");
    
    if (isHtml) {
      console.error("[API] Got HTML response instead of JSON - Web App may be blocking server requests");
      console.error("[API] HTML preview:", text.substring(0, 500));
      return NextResponse.json(
        { 
          error: "Web App returned HTML instead of JSON. The Web App may need to be redeployed with 'Anyone' access, or it's blocking server-side requests.",
          details: "Direct browser access works, but server-side requests are blocked. Try redeploying the Web App.",
          htmlPreview: text.substring(0, 300)
        },
        { status: 502 }
      );
    }
    
    if (!res.ok) {
      console.error("[API] Error response:", text.substring(0, 500));
      return NextResponse.json(
        { error: text || res.statusText, status: res.status },
        { status: res.status >= 400 && res.status < 600 ? res.status : 500 }
      );
    }
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("[API] JSON parse error:", parseErr);
      console.error("[API] Response text:", text.substring(0, 500));
      return NextResponse.json(
        { error: "Invalid JSON from API", details: text.substring(0, 200) },
        { status: 502 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[API] Exception:", message);
    console.error("[API] Stack:", stack);
    return NextResponse.json(
      { error: message, details: process.env.NODE_ENV === "development" ? stack : undefined },
      { status: 500 }
    );
  }
}
