import { NextRequest, NextResponse } from "next/server";

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_APP_URL || "";

export async function POST(request: NextRequest) {
  if (!SHEETS_URL) {
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
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...rest }),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: text || res.statusText },
        { status: res.status }
      );
    }
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON from API" }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
