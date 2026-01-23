/**
 * Cloudflare Turnstile Server-Side Verification
 *
 * Environment variables:
 * - TURNSTILE_SECRET_KEY: Your widget's secret key from Cloudflare dashboard
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: Your widget's site key (for client-side)
 */

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
}

interface VerifyResult {
  success: boolean;
  error?: string;
  errorCodes?: string[];
}

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token server-side
 *
 * @param token - The token from the client-side widget
 * @param remoteIp - Optional visitor IP address (recommended for accuracy)
 * @returns Verification result with success status and any errors
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<VerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured, allow the request (development mode)
  if (!secretKey) {
    console.warn(
      "TURNSTILE_SECRET_KEY not set - skipping verification in development"
    );
    return { success: true };
  }

  // Token is required when Turnstile is configured
  if (!token) {
    return {
      success: false,
      error: "Verification token is required",
      errorCodes: ["missing-input-response"],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Verification service error: ${response.status}`,
      };
    }

    const result: TurnstileVerifyResponse = await response.json();

    if (result.success) {
      return { success: true };
    }

    // Map error codes to user-friendly messages
    const errorMessage = getErrorMessage(result["error-codes"] || []);

    return {
      success: false,
      error: errorMessage,
      errorCodes: result["error-codes"],
    };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return {
      success: false,
      error: "Failed to verify challenge",
    };
  }
}

/**
 * Get a user-friendly error message from Turnstile error codes
 */
function getErrorMessage(errorCodes: string[]): string {
  if (errorCodes.includes("invalid-input-response")) {
    return "Verification failed. Please try again.";
  }
  if (errorCodes.includes("timeout-or-duplicate")) {
    return "Verification expired. Please try again.";
  }
  if (errorCodes.includes("bad-request")) {
    return "Invalid verification request.";
  }
  if (errorCodes.includes("internal-error")) {
    return "Verification service unavailable. Please try again.";
  }
  return "Verification failed. Please try again.";
}

/**
 * Check if Turnstile is configured
 */
export function isTurnstileConfigured(): boolean {
  return !!(
    process.env.TURNSTILE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}
