import { NextResponse } from "next/server";
import { IOS_BUNDLE_ID } from "@/lib/appLinks";

export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID || "";
  const appId = teamId ? `${teamId}.${IOS_BUNDLE_ID}` : null;

  const body = {
    applinks: {
      apps: [],
      details: appId
        ? [
            {
              appID: appId,
              paths: ["/join/*", "/join"],
            },
          ]
        : [],
    },
  };

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
