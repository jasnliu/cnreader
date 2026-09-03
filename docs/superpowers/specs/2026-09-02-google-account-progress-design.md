# Google Account Progress Design

## Goal

Add Google account sign-in and per-account cloud progress while retaining the existing local-only guest experience.

## Agreed behavior

- Signed-out learners continue to use the existing CNReader-owned `localStorage` keys only.
- After Google sign-in, an existing `user_progress` row is authoritative and replaces the browser's durable CNReader progress.
- After Google sign-in, a missing row means this is a new account: the current guest progress is written as the account's first cloud save.
- After that initial decision, edits to a durable progress key synchronize the latest whole snapshot to the authenticated account.
- OAuth session data is deliberately excluded from progress backups and cloud snapshots.
- Sign-out saves queued progress first, then removes the local OAuth session. It does not erase the local cached progress.

## Architecture

`progress-backup.js` remains the sole owner of the list of durable CNReader keys and exposes internal snapshot/restore helpers in addition to its existing console backup interface. A new dependency-free `account-sync.js`, loaded immediately after it on every page, uses the Supabase Auth and REST HTTP APIs directly.

The script starts Google OAuth by navigating to Supabase's `/auth/v1/authorize` endpoint using the implicit browser flow. On the return URL it consumes the session fragment, persists it under a non-backup local key, removes tokens from the visible URL, and reads the authenticated user's `user_progress` row through the REST API. It then restores the existing account snapshot or creates the missing row from the guest snapshot. Row Level Security in the supplied SQL protects the row server-side.

The main page owns the visible account control. Other pages load synchronization so quiz, review, custom-test, selector, and worksheet progress are saved under the active account without changing their layouts.

## Data format

`user_progress.progress` stores this versioned object:

```json
{
  "format": "cnreader-progress",
  "version": 1,
  "data": {
    "charProgress": "{\"0\":6}",
    "currentUnit": "0"
  }
}
```

The strings exactly preserve the localStorage representation and preserve the existing backup-format compatibility rules.

## Error handling

- A failed cloud load or save leaves the local browser state intact and leaves a visible status message on the main-page account control.
- An expired session is refreshed before requests. A failed refresh returns the user to guest state without deleting their local progress.
- Failed OAuth callbacks surface a short status message and remove OAuth parameters from the address bar.

## Testing

Node VM tests will verify the two migration outcomes, the exact OAuth authorization URL, persistence exclusions, and cloud upserts. Existing JavaScript syntax and test suites remain green.
