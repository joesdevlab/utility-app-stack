/**
 * Hub Event Client
 *
 * Fire-and-forget event emission to the Laika Dynamics Hub.
 * Gated behind HUB_API_URL — if unset, all calls are no-ops.
 * Never blocks or breaks ApprenticeLogNZ if the Hub is down.
 *
 * Uses Next.js `after()` to ensure the fetch completes after the
 * response is sent — without this, Vercel serverless functions can
 * terminate before the fire-and-forget fetch finishes.
 */

import { after } from "next/server";

async function sendHubEvent(eventType: string, payload: Record<string, unknown>) {
  const hubUrl = process.env.HUB_API_URL;
  if (!hubUrl) return;

  try {
    const res = await fetch(`${hubUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HUB_API_KEY ? { "X-Api-Key": process.env.HUB_API_KEY } : {}),
      },
      body: JSON.stringify({
        event_type: eventType,
        source: "apprenticelog",
        payload,
      }),
    });
    console.log(`[Hub] Emitted ${eventType} — ${res.status}`);
  } catch (err) {
    console.error(`[Hub] Failed to emit ${eventType}:`, err);
  }
}

export function emitHubEvent(eventType: string, payload: Record<string, unknown>) {
  const hubUrl = process.env.HUB_API_URL;
  if (!hubUrl) return;

  after(() => sendHubEvent(eventType, payload));
}
