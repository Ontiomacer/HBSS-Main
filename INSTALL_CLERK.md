# Install Clerk Package

## Quick Fix

Run this command in the `enigma-forge-ui-main` folder:

```bash
npm install @clerk/clerk-react
```

Then restart the dev server:

```bash
npm run dev
```

## What This Does

- Installs the Clerk React SDK
- Enables Clerk authentication
- Skips the CipherCore login page when you're authenticated with Clerk

## How It Works Now

1. **If NOT signed in with Clerk**: Shows CipherCore login page
2. **If signed in with Clerk**: Skips directly to Dashboard

## Usage

1. Install Clerk: `npm install @clerk/clerk-react`
2. Start dev server: `npm run dev`
3. Open http://localhost:5174
4. You'll see the CipherCore login (if not authenticated)
5. Once you authenticate with Clerk (via HBSS chat), you'll skip this page automatically

## For HBSS Chat

The HBSS chat route (`/hbss`) uses Clerk authentication. When you sign in there, you'll be authenticated for the whole app, and the CipherCore login will be skipped on the home page.
