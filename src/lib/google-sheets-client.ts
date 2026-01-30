/**
 * Google Sheets API Client
 * Direct access to Google Sheets without Apps Script
 */

import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
// Handle private key - it might come with literal \n or actual newlines
let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || '';
if (PRIVATE_KEY) {
  // Replace literal \n with actual newlines
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
  // Remove quotes if present
  PRIVATE_KEY = PRIVATE_KEY.replace(/^["']|["']$/g, '');
}

let authClient: any = null;

function getAuthClient() {
  if (!authClient) {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      throw new Error(`Google Sheets API credentials not configured. Email: ${!!SERVICE_ACCOUNT_EMAIL}, Key: ${!!PRIVATE_KEY}`);
    }
    
    // Validate private key format
    if (!PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid private key format - missing BEGIN PRIVATE KEY');
    }
    
    try {
      authClient = new google.auth.JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (err) {
      throw new Error(`Failed to create JWT auth client: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  return authClient;
}

async function getSheetsClient() {
  const auth = getAuthClient();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

export interface SheetData {
  [key: string]: any;
}

/**
 * Read data from a sheet tab
 */
export async function readSheet(sheetName: string): Promise<any[][]> {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  return response.data.values || [];
}

/**
 * Append a row to a sheet tab
 */
export async function appendRow(sheetName: string, row: any[]): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });
}

/**
 * Update a cell value
 */
export async function updateCell(
  sheetName: string,
  rowIndex: number,
  colIndex: number,
  value: any
): Promise<void> {
  const sheets = await getSheetsClient();
  const colLetter = String.fromCharCode(65 + colIndex); // A, B, C, etc.
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${colLetter}${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[value]],
    },
  });
}

/**
 * Update multiple cells in a range
 */
export async function updateRange(
  sheetName: string,
  range: string,
  values: any[][]
): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

/**
 * Get all rows matching a condition
 */
export async function findRows(
  sheetName: string,
  columnIndex: number,
  value: string
): Promise<number[]> {
  const data = await readSheet(sheetName);
  const matchingRows: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] && String(data[i][columnIndex]) === String(value)) {
      matchingRows.push(i);
    }
  }
  
  return matchingRows;
}

/**
 * Ensure a sheet exists, create if not
 */
export async function ensureSheet(sheetName: string, headers: string[]): Promise<void> {
  const sheets = await getSheetsClient();
  
  try {
    // Try to read the sheet
    await readSheet(sheetName);
    // Sheet exists, check if it has headers
    const data = await readSheet(sheetName);
    if (data.length === 0 && headers.length > 0) {
      await updateRange(sheetName, 'A1', [headers]);
    }
  } catch (error: any) {
    // Sheet doesn't exist, create it
    if (error.code === 400 || error.message?.includes('Unable to parse range')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
      
      // Add headers
      if (headers.length > 0) {
        await updateRange(sheetName, 'A1', [headers]);
      }
    } else {
      throw error;
    }
  }
}

/**
 * Get sheet ID by name
 */
async function getSheetId(sheetName: string): Promise<number> {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
  if (!sheet?.properties?.sheetId) {
    throw new Error(`Sheet ${sheetName} not found`);
  }
  return sheet.properties.sheetId;
}

/**
 * Delete a row by index (1-based, where 1 is header)
 */
export async function deleteRow(sheetName: string, rowIndex: number): Promise<void> {
  const sheets = await getSheetsClient();
  const sheetId = await getSheetId(sheetName);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

/**
 * Find and update a cell by matching criteria
 */
export async function findAndUpdateCell(
  sheetName: string,
  searchColIndex: number,
  searchValue: string,
  updateColIndex: number,
  updateValue: any
): Promise<boolean> {
  const data = await readSheet(sheetName);
  for (let i = 1; i < data.length; i++) {
    if (data[i] && String(data[i][searchColIndex]) === String(searchValue)) {
      await updateCell(sheetName, i, updateColIndex, updateValue);
      return true;
    }
  }
  return false;
}
