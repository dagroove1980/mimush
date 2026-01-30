import { NextRequest, NextResponse } from "next/server";
import { readSheet } from "@/lib/google-sheets-client";

export async function GET(request: NextRequest) {
  // Clean values for display
  const cleanSpreadsheetId = (process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '').replace(/\nN\n$/, '').trim();
  const cleanEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').replace(/\nN\n$/, '').trim();
  const cleanKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\nN\n$/, '').trim();
  
  const info: any = {
    hasSpreadsheetId: !!cleanSpreadsheetId,
    hasServiceAccountEmail: !!cleanEmail,
    hasPrivateKey: !!cleanKey,
    spreadsheetId: cleanSpreadsheetId || "NOT SET",
    serviceAccountEmail: cleanEmail || "NOT SET",
    privateKeyLength: cleanKey.length || 0,
    privateKeyPreview: cleanKey.substring(0, 50) || "NOT SET",
    nodeEnv: process.env.NODE_ENV,
    rawSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.substring(0, 100),
    rawEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.substring(0, 100),
  };

  // Test connection
  try {
    const data = await readSheet('Users');
    return NextResponse.json({
      success: true,
      message: "Credentials working!",
      sheetRows: data.length,
      ...info,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({
      success: false,
      error: message,
      stack: process.env.NODE_ENV === "development" ? stack : undefined,
      ...info,
    }, { status: 500 });
  }
}
