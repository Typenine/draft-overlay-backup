// Draft order configuration
export const TOTAL_ROUNDS = 4;
export const TEAMS_PER_ROUND = 12;

// Generate snake draft order for multiple rounds
export function generateDraftOrder() {
  const draftOrder = [];
  const teamIds = Array.from({ length: TEAMS_PER_ROUND }, (_, i) => i + 1);

  for (let round = 0; round < TOTAL_ROUNDS; round++) {
    // For even rounds, reverse the order (snake draft)
    const roundOrder = round % 2 === 0 ? [...teamIds] : [...teamIds].reverse();
    draftOrder.push(...roundOrder);
  }

  return draftOrder;
}

// Default draft order
export const defaultDraftOrder = generateDraftOrder();
