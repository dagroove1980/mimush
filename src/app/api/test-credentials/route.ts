import { NextRequest, NextResponse } from "next/server";
import { readSheet } from "@/lib/google-sheets-client";

export async function GET(request: NextRequest) {
  const info: any = {
    hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "NOT SET",
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "NOT SET",
    privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    privateKeyPreview: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50) || "NOT SET",
    nodeEnv: process.env.NODE_ENV,
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
