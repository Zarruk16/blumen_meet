# Recording without AWS (free options)

You **do not need AWS** to use Blumen Meet.

## What works with zero storage cost

| Feature | Needs AWS? |
|---------|------------|
| Video meetings | No |
| Chat, reactions, screen share | No |
| AI summaries | No AWS (uses OpenAI — pay per use, often pennies) |
| Recording | No AWS if using **LiveKit Cloud egress** |

## Recording requires storage (free R2 — not AWS)

LiveKit’s API **requires** a storage destination (S3-compatible). AWS is optional.

**Free option: Cloudflare R2** (~10 GB/month free)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → Create bucket  
2. **Manage R2 API tokens** → Create token with read/write  
3. Add to `.env.local`:

```env
LIVEKIT_S3_BUCKET=blumenmeet
LIVEKIT_S3_REGION=auto
# From R2 bucket → Settings → S3 API (no /blumenmeet at the end)
LIVEKIT_S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
# From R2 → Manage R2 API tokens → Create API token
LIVEKIT_S3_ACCESS_KEY=your_access_key_id
LIVEKIT_S3_SECRET=your_secret_access_key
NEXT_PUBLIC_RECORDING_ENABLED=true
```

4. Restart `npm run dev`, join as **host**, tap **Record**  
5. View jobs in LiveKit Cloud → **Egresses**

## Optional free S3-compatible storage (not AWS)

If you later want downloads in `/recordings`:

**Cloudflare R2** — free tier (~10 GB/month), S3-compatible:

1. [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create bucket
2. Create API token with R2 read/write
3. Add to `.env.local`:

```env
LIVEKIT_S3_BUCKET=your-r2-bucket-name
LIVEKIT_S3_REGION=auto
LIVEKIT_S3_ACCESS_KEY=...
LIVEKIT_S3_SECRET=...
```

Use the R2 endpoint in LiveKit if required (see LiveKit docs for custom `endpoint`).

## OpenAI cost note

AI summaries use your OpenAI key. That is separate from AWS — small usage is usually very cheap. You can skip summaries if you want zero API spend.

## Summary

- **Skip AWS entirely**
- Use meetings + AI as you are now
- Try **Record** → check **Egresses** in LiveKit Cloud
- Add R2 later only if you need in-app downloads
