import "dotenv/config";
import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "livekit-token-server" });
});

app.post("/get-token", async (req, res) => {
  try {
    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({
        error: "Server misconfigured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL.",
      });
    }

    const { roomName, userName, identity, isHost } = req.body || {};

    if (!roomName || !userName) {
      return res.status(400).json({ error: "roomName and userName are required." });
    }

    const participantIdentity =
      (typeof identity === "string" && identity.trim()) ||
      `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: userName,
      ttl: "6h",
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: Boolean(isHost),
    });

    const jwt = await token.toJwt();

    return res.json({
      token: jwt,
      serverUrl: livekitUrl,
      identity: participantIdentity,
    });
  } catch (error) {
    console.error("[get-token]", error);
    return res.status(500).json({ error: "Failed to generate LiveKit token." });
  }
});

app.listen(PORT, () => {
  console.log(`LiveKit token server listening on http://localhost:${PORT}`);
});
