# Fix Private Key in Vercel

## The Problem

The error "invalid_grant: Invalid grant: account not found" means the private key format in Vercel is incorrect. The newlines (`\n`) need to be preserved.

## Solution: Update Private Key in Vercel Dashboard

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/davids-projects-794668e3/mimush/settings/environment-variables

2. Find `GOOGLE_PRIVATE_KEY` and click **Edit**

3. Delete the current value

4. Copy the private key from your `.env.local` file (the entire value including quotes and `\n`)

5. In Vercel, paste it **exactly as it appears** in `.env.local`:
   ```
   "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC8Nc9bkkKIqSTk\n0ZvjeGix2g1izuhc6WucnTZS0noc3d7etF4hCbBuj0i5neRP1njRKsCnB8FOhTHM\nUAMRVVE/9zl5QIiyA5X1++dW09n4+A2DlTy0ebDTHuCeNlGE3AXD+QI3XcGrPmCB\nrNSU3Lc0K8OJk4vB2LEclLMFMyqrKgyv55ZMkF1dRJviYEUOw+Rcje1GxW+w54fm\nbvZXrurOwAH25dAwQ3PbHQa9eGaXfZxPcyqEpFPjWc4NpqiiSTghzAeJTCTOr9NQ\nyzEBSuD4Yre0RW0v76kRZ92HvH3RzLTrOhnqvLbko1b2/duggiYBJ51yF80fl2N9\necsDRbXFAgMBAAECggEAGQbzxaq/j7IkTowj9V3V2C6VgJngcrh0X51VM7K627tS\nL12fNbf23uDNTCd3jHlJ1BCiESP6G9Gg41kRa1zjwsSCf0HqW3eYGZ9vbg+aSN3d\nWC3AZoRXE9/jgQ5ajTb/ykVCuu+L+RRAm4XKt+fYscaPCCyXVUXWGWWZn5uj9SIV\ngN+xjkiQKQqGC+vb7YnOr+2PFIKjS0X8XjW/13M3scqEVO11rocrtfspvT8miids\nVxtocaaCZISIX8c5X/l5rZHwjJKKvvPydQou3yyq2YqV41MoziRSPXPXSosNXXh8\nyqT4ElAcbk31ce0Qj1ET9FR13Nlnkim0ApJE7INYgQKBgQD/2Tyz+nEG8CLHw4Bt\nRm3LmJA+GzgFpDTMTL28iAMswATQEOeFbJT0A0H+TbNB7kp1onLzOuKO38rEdMbT\nSd9imS7OtsKmMn60WQ2Hq0tAiMYHcLAU/YBlnnityKL+tYges36f7IyqIC89pRjo\nNfFBngPTOvZS1IqP7F7q6hKeRQKBgQC8UlM+j3v7cKT670CNKhzwqyHO+1N91itH\nPuOj1g7sqzkQtKuxO9is8d0rv6NPFbqHNcfOYvSB0vOseZ+QCvKDhfeGqsZSZJBQ\nmvgOIJ1jFEN4TIqgQOm7u8h8B9pC2nEY/lUTGNVPJrA5Iw4KS8EgRZryJkpv03+e\n6RkvuiHxgQKBgQDke32BgVO1DXkSCx7C99WPr8SJIkeqihV4qcP7/T9QlH73zVDl\nT63KKKqjz4IZjBPE7/lWDC1NyL/NKDhzcpJi/EfX5VD5mTicGLdDhI7kqACpnlIx\nvJ4QojBFils9uqJAQK4BZf/M4octtyYCIkI9Bj+GQS6/k/3WQBIYGkfcPQKBgQCU\npxd2xqRDckOIoNr/k0KM50kkrVbWefxnnMjsRsg5IV9GRJdSq775pWHEat1qS+iV\nWmqCC7Kd1/rpJohBl6KfF1ywPJWX7DHOrsUnwa76ysAHccPrg9H8ktpKrZgoNW4Z\nIInfLTcT56IrN/SZQ/sKkmcgxgD0DKsssStkdTTeAQKBgQCn24mguUSYQZ6fiZgt\nGKhJMo5vRTWqQ+0NvQT2ilQFkGoX+6rnngzIDoMbITE7E/cMZAadu29nGSAGLkGP\nZKG6EnDGHtwmRISXP48j7fcn5H45WEx1t80ZzH4DuIe1hO0Dsqpfh/7zGPBch/EM\nq3r+Lah0Bt9jfMCgW2JL4i3VCg==\n-----END PRIVATE KEY-----\n"
   ```

6. **Important**: Make sure the `\n` characters are preserved (they should appear as literal `\n` in the text, not as actual line breaks)

7. Update for **Production**, **Preview**, and **Development**

8. Redeploy: The code will automatically handle the `\n` conversion

### Option 2: Via CLI (Alternative)

If the dashboard doesn't work, you can try:

```bash
# Remove old
vercel env rm GOOGLE_PRIVATE_KEY production

# Add new (paste when prompted)
vercel env add GOOGLE_PRIVATE_KEY production
# Paste the entire private key value from .env.local
```

## Verify

After updating, test:
1. Visit: https://mimush.vercel.app/api/test-credentials
2. Should show `success: true` if credentials are correct

## Common Issues

- **Newlines lost**: Make sure `\n` appears as literal text, not actual line breaks
- **Quotes**: The key should be wrapped in quotes in `.env.local` but Vercel might handle it differently
- **Extra spaces**: Make sure there are no extra spaces before/after the key
