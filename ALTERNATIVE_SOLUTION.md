# Alternative Solution: Client-Side Direct Access

If server-side requests continue to be blocked, we can modify the app to call Google Apps Script directly from the client-side (browser) instead of through the Next.js API proxy.

## Why This Might Work

Google Apps Script Web Apps work reliably from browsers but sometimes block server-side requests. By calling directly from the client, we bypass this issue.

## Implementation

### Option 1: Modify sheets-api.ts to call directly

Change `/src/lib/sheets-api.ts` to call the Web App URL directly instead of `/api/sheets`:

```typescript
const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_APP_URL || "";

async function fetchApi<T>(
  action: string,
  _method: "GET" | "POST" = "POST",
  body?: Record<string, unknown>
): Promise<T> {
  // Call directly instead of through proxy
  const url = `${SHEETS_URL}?action=${encodeURIComponent(action)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (data as { error?: string })?.error || res.statusText;
    throw new Error(err);
  }
  return data as T;
}
```

**Pros:**
- Works reliably (browser requests aren't blocked)
- Simpler (no proxy needed)
- Faster (one less hop)

**Cons:**
- Exposes the Web App URL to clients (but it's already public anyway)
- No server-side logging/error handling

### Option 2: Keep proxy but handle HTML responses

Keep the current architecture but add better error handling for HTML responses.

## Recommendation

Try Option 1 - it's simpler and should work immediately since browser access already works.
