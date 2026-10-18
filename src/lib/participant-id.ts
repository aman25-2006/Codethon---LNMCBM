/**
 * Participant ID Generation Utility
 * Generates collision-safe, deterministic sequential participant identifiers.
 * Format: LNMC-COD-0001, LNMC-COD-0002, etc.
 */

const DEFAULT_PREFIX = process.env.PARTICIPANT_ID_PREFIX || "LNMC-COD";

export function generateParticipantIds(
  count: number,
  existingIds: string[],
  prefix: string = DEFAULT_PREFIX
): string[] {
  const existingSet = new Set(existingIds.map((id) => id.trim().toUpperCase()));
  const prefixUpper = prefix.trim().toUpperCase();
  const regex = new RegExp(`^${prefixUpper}-(\\d+)$`);

  let maxNum = 0;
  existingIds.forEach((rawId) => {
    const id = rawId.trim().toUpperCase();
    const match = id.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const generated: string[] = [];
  let candidateNum = maxNum + 1;

  while (generated.length < count) {
    const candidate = `${prefixUpper}-${String(candidateNum).padStart(4, "0")}`;
    if (!existingSet.has(candidate)) {
      existingSet.add(candidate);
      generated.push(candidate);
    }
    candidateNum++;
  }

  return generated;
}

export function generateSingleParticipantId(
  existingIds: string[],
  prefix: string = DEFAULT_PREFIX
): string {
  return generateParticipantIds(1, existingIds, prefix)[0];
}
