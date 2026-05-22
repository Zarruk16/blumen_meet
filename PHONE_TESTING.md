# Test on your phone (no deployment)

## iPhone Personal Hotspot (recommended for you)

When your Mac uses **iPhone hotspot**, `localtunnel` often returns **Bad Gateway**. Use direct hotspot HTTPS instead:

```bash
npm run dev:stop
npm run dev:phone:hotspot
```

No Homebrew needed — uses **OpenSSL** (already on macOS).

On your phone, open the printed URL, e.g.:

```
https://172.20.10.2:3000/join/<room-id>
```

(Mac IP is often `172.20.10.2` on Personal Hotspot — use the IP from your terminal.)

---

## HTTPS tunnel (Wi‑Fi / home network)

```bash
npm run dev:phone
```

Wait ~10 seconds. The terminal prints a URL like:

```
https://something-random.loca.lt
```

**On your phone:** open that URL (not `192.168.x.x` unless using LAN mode below).

1. If you see a tunnel “Continue” page, tap it once.
2. Create a meeting on your Mac, then change the join link from `localhost` to the tunnel URL.

Example:

- Mac link: `http://localhost:3000/join/abc-123`
- Phone link: `https://your-tunnel.loca.lt/join/abc-123`

Camera, mic, and LiveKit work because the tunnel is real HTTPS.

---

## Why you saw `ERR_SSL_PROTOCOL_ERROR`

The phone used **https://** but the dev server was only serving **http://**.

That happens when:

- `npm run dev` or `npm run dev:network` is running (HTTP only), but you open `https://192.168.91.10:3000`, or
- `npm run dev:phone` failed to create certificates and fell back to HTTP.

**Fix:** use `npm run dev:phone` (tunnel) or `npm run dev:phone:lan` (real HTTPS on Wi‑Fi).

---

## Option B: Same Wi‑Fi + HTTPS on LAN IP

```bash
brew install mkcert
mkcert -install
npm run dev:phone:lan
```

Then on your phone open **`https://192.168.x.x:3000`** (must be `https`, not `http`).

---

## Option C: HTTP on LAN (pages load, no camera on phone)

```bash
npm run dev:network
```

Open **`http://192.168.91.10:3000`** (not https). UI works; camera/mic are blocked on mobile.

---

## Join without logging in on phone

Use `/join/<room-id>` — no account needed. Skip the home page on phone.

---

## Google login on phone

### Google blocks private hotspot IPs

Google **does not allow** OAuth redirect URIs like `https://172.20.10.4:3000/...`. You will see:

> `device_id and device_name are required for private IP`

This is a **Google policy**, not a bug in your app. **You cannot fix it** with hotspot IP + Google login.

### Option A — Google login on phone (use a public HTTPS tunnel)

```bash
npm run dev:stop
npm run dev:phone
```

Wait for a URL like `https://something.trycloudflare.com`. On your phone, open that URL.

In [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth client → **Authorized redirect URIs**, add:

```
https://something.trycloudflare.com/api/auth/callback/google
```

(Use the exact URL from your terminal. It changes each time you run `dev:phone`.)

### Option B — Meetings without Google (hotspot IP works)

```bash
npm run dev:phone:hotspot
```

On phone: `https://172.20.10.x:3000/join/<room-id>` — no Google account needed.

1. Sign in on your **Mac** at `http://localhost:3000`
2. Start a meeting, copy the join link
3. On phone, open `https://172.20.10.x:3000/join/<same-room-id>`

### Never use on phone

| URL | Result |
|-----|--------|
| `localhost:3000` | Can’t reach Mac |
| `https://172.20.10.x` + Google login | Google blocks (error 400) |

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| `ERR_SSL_PROTOCOL_ERROR` | Server is HTTP; use `npm run dev:phone` or `http://` only for dev:network |
| `Bad Gateway` (loca.lt / tunnel) | Use **`npm run dev:phone:hotspot`** on iPhone hotspot instead |
| Port in use | Run `npm run dev:stop` then start again |
| Phone can’t reach Mac | On hotspot use `172.20.10.x` URL from terminal |
| Tunnel URL changes | Normal each run — copy the new URL from the terminal |
| Google `device_id` / private IP error | Google blocks `172.20.10.x` — use `npm run dev:phone` (tunnel) or `/join` without login |
| Google login “can’t be reached” after sign-in | You used `localhost` on phone — use tunnel URL or hotspot `/join` |
