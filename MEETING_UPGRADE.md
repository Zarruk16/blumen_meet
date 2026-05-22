# Premium Meeting UI Upgrade

## New dependencies

```bash
npm install framer-motion zustand
```

## Architecture

```
src/
  features/
    meeting/          # Zoom-style UI
    ai-summary/       # AI summary panel
  store/meetingStore.js
  models/Recording.js
  models/MeetingSummary.js
  app/api/recordings/
  app/recordings/
  app/meetings/[roomId]/summary/

server/
  routes/recording.js
  controllers/recordingController.js
  services/recordingService.js
```

## Meeting UI

- **Layouts:** Speaker-focused + grid (toggle in top bar / settings)
- **Top bar:** Timer, participant count, connection quality, recording badge, layout toggle, share, leave
- **Control bar:** Mic, camera, screen share, chat, participants, record (host), raise hand, reactions, AI summary, settings, fullscreen, end call
- **Panels:** Chat, participants, meeting info, AI summary
- **Keyboard:** M mic, V camera, C chat, P participants, F fullscreen, Shift+L leave

## Recording (LiveKit Egress)

Requires LiveKit Cloud Egress + S3 (or compatible storage):

```env
LIVEKIT_S3_BUCKET=
LIVEKIT_S3_REGION=
LIVEKIT_S3_ACCESS_KEY=
LIVEKIT_S3_SECRET=
```

**Next.js API:**
- `POST /api/recordings/start`
- `POST /api/recordings/stop`
- `GET /api/recordings`

**Express (optional):**
- `POST /start-recording`
- `POST /stop-recording`
- `GET /recordings`

Dashboard: `/recordings`

## AI summaries

```env
OPENAI_API_KEY=           # optional — real summaries
OPENAI_SUMMARY_MODEL=gpt-4o-mini
```

- `POST /api/meetings/[roomId]/summary`
- `GET /api/meetings/[roomId]/summary`
- In-meeting panel + `/meetings/[roomId]/summary`

Without OpenAI, a structured placeholder summary is generated.

## Run

```bash
npm run dev
# optional recording/egress server
npm run livekit-server
```
