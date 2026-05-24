# Meeting links → native app (Zoom-style)

Shared links use the **web** format:

```text
https://blumen-meet.vercel.app/join/{roomId}
```

## Behaviour

| Device | App installed | Result |
|--------|---------------|--------|
| Android | Yes | Link opens **Blumen Meet** (verified App Link) |
| Android | No | Browser join lobby + “Open app” banner |
| iOS | Yes | Opens app when Universal Links + `APPLE_TEAM_ID` are configured |
| iOS | No | Browser join lobby |
| Desktop | — | Web join lobby |

## Deploy (required for automatic Android open)

1. **Deploy** `blumen_meet` to Vercel (includes `/.well-known/assetlinks.json`).
2. **Rebuild** the mobile APK after `app.config.ts` intent filters change:

   ```bash
   cd mobile-app
   eas build --profile preview --platform android
   ```

3. Install the **new** APK on phones (App Links are baked into the build).

Verify Android verification:

```bash
curl -s https://blumen-meet.vercel.app/.well-known/assetlinks.json | jq .
```

## Environment variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `ANDROID_APP_LINK_SHA256` | Optional override; default is the EAS preview keystore fingerprint |
| `APPLE_TEAM_ID` | Required for iOS Universal Links (10-character Apple Team ID) |

Get a new Android fingerprint after keystore rotation:

```bash
eas credentials -p android
# → View keystore → SHA-256 fingerprint
```

Or from an APK:

```bash
apksigner verify --print-certs your.apk
```

## Custom domain

Set `EXPO_PUBLIC_WEB_URL` in the mobile app and deploy the same host’s `.well-known` files on that domain.
