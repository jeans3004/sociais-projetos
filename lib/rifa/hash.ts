import { createHash } from "crypto";

export function computeIntegrityHash(
  seed: string,
  winners: string[],
  campaignId: string
): string {
  const hash = createHash("sha256");
  hash.update(seed);
  hash.update(campaignId);
  winners.forEach((winner) => hash.update(winner));
  return hash.digest("hex");
}
