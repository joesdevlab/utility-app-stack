/**
 * Hub Event Client
 *
 * Fire-and-forget event emission to the Laika Dynamics Hub.
 * Gated behind HUB_API_URL — if unset, all calls are no-ops.
 * Never blocks or breaks ApprenticeLogNZ if the Hub is down.
 */

export async function emitHubEvent(eventType: string, payload: Record<string, unknown>) {
  const hubUrl = process.env.HUB_API_URL;
  if (!hubUrl) return;

  try {
    await fetch(`${hubUrl}/events`, {
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
  } catch {
    // Fire-and-forget — never break ApprenticeLogNZ if Hub is down
  }
}
