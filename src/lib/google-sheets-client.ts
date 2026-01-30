/**
 * Google Sheets API Client
 * Direct access to Google Sheets without Apps Script
 */

import { google } from 'googleapis';

// Clean environment variables - remove any trailing \nN\n from CLI input
function cleanEnvVar(value: string | undefined): string {
  if (!value) return '';
  // Remove trailing \nN\n that might have been added by CLI
  return value.replace(/\nN\n$/, '').trim();
}

const SPREADSHEET_ID = cleanEnvVar(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
const SERVICE_ACCOUNT_EMAIL = cleanEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

// Handle private key - it might come with literal \n or actual newlines
let PRIVATE_KEY = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY);
if (PRIVATE_KEY) {
  // Remove surrounding quotes if present
  PRIVATE_KEY = PRIVATE_KEY.replace(/^["']|["']$/g, '');
  // Replace literal \n with actual newlines (handle both \\n and \n)
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
  // Also handle if it's already got newlines but escaped
  if (!PRIVATE_KEY.includes('\n') && PRIVATE_KEY.includes('\\n')) {
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
  }
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

// Cache to track which sheets we've checked (reduces API calls)
const sheetExistenceCache = new Set<string>();

// In-memory cache for readSheet calls (TTL: 30 seconds)
interface CacheEntry {
  data: any[][];
  timestamp: number;
}
const readCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30000; // 30 seconds

// Rate limiting: track last request time and add delay if needed
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 150; // 150ms between requests (max ~6-7 req/sec to stay under 60/min)

async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

/**
 * Read data from a sheet tab
 * Uses caching to reduce API calls
 */
export async function readSheet(sheetName: string, useCache: boolean = true): Promise<any[][]> {
  // Check cache first
  if (useCache) {
    const cacheKey = sheetName;
    const cached = readCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  await rateLimit();
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  const data = response.data.values || [];
  
  // Cache the result
  if (useCache) {
    readCache.set(sheetName, {
      data,
      timestamp: Date.now(),
    });
  }
  
  return data;
}

/**
 * Append a row to a sheet tab
 */
export async function appendRow(sheetName: string, row: any[]): Promise<void> {
  await rateLimit();
  // Clear cache for this sheet since we're writing to it
  readCache.delete(sheetName);
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
  await rateLimit();
  // Clear cache for this sheet since we're writing to it
  readCache.delete(sheetName);
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
  await rateLimit();
  // Clear cache for this sheet since we're writing to it
  readCache.delete(sheetName);
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
 * Uses caching to avoid repeated API calls
 */
export async function ensureSheet(sheetName: string, headers: string[]): Promise<void> {
  // If we've already checked this sheet, skip entirely
  if (sheetExistenceCache.has(sheetName)) {
    return;
  }
  
  await rateLimit();
  const sheets = await getSheetsClient();
  
  try {
    // Try to read the sheet (just first row to check existence)
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    
    // Sheet exists - mark in cache
    sheetExistenceCache.add(sheetName);
    
    // Check if headers exist (only if headers provided)
    if (headers.length > 0) {
      const data = await readSheet(sheetName);
      if (data.length === 0) {
        await updateRange(sheetName, 'A1', [headers]);
      }
    }
  } catch (error: any) {
    // Sheet doesn't exist, create it
    if (error.code === 400 || error.message?.includes('Unable to parse range') || error.message?.includes('not found')) {
      await rateLimit();
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
      
      // Mark in cache
      sheetExistenceCache.add(sheetName);
    } else {
      throw error;
    }
  }
}

/**
 * Get sheet ID by name
 */
async function getSheetId(sheetName: string): Promise<number> {
  await rateLimit();
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
  await rateLimit();
  // Clear cache for this sheet since we're modifying it
  readCache.delete(sheetName);
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
