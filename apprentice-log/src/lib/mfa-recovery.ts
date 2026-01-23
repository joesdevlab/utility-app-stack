import crypto from "crypto";

// Generate a set of recovery codes
export function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8 random bytes and convert to hex, then format as XXXX-XXXX
    const bytes = crypto.randomBytes(4);
    const hex = bytes.toString("hex").toUpperCase();
    const code = `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
    codes.push(code);
  }
  return codes;
}

// Hash a recovery code for storage
export function hashRecoveryCode(code: string): string {
  return crypto
    .createHash("sha256")
    .update(code.replace("-", "").toUpperCase())
    .digest("hex");
}

// Verify a recovery code against stored hashes
export function verifyRecoveryCode(
  inputCode: string,
  storedHashes: string[]
): { valid: boolean; usedIndex: number } {
  const inputHash = hashRecoveryCode(inputCode);
  const index = storedHashes.findIndex((hash) => hash === inputHash);
  return {
    valid: index !== -1,
    usedIndex: index,
  };
}
