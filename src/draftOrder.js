// Draft order configuration
export const TOTAL_ROUNDS = 4;
export const TEAMS_PER_ROUND = 12;

// Class representing a draft pick with asset ID and team information
export class DraftPick {
  constructor(teamId, index) {
    this.assetId = (index + 1).toString().padStart(4, '0');
    this.originalTeamId = teamId;
    this.currentTeamId = teamId;
    this.round = Math.floor(index / TEAMS_PER_ROUND) + 1;
    this.pickInRound = (index % TEAMS_PER_ROUND) + 1;
    this.overallPick = index + 1;
    this.tradeHistory = [];
  }

  // Make array indexing return currentTeamId for backward compatibility
  valueOf() {
    return this.currentTeamId;
  }
  
  // Make string concatenation/comparison use currentTeamId
  toString() {
    return this.currentTeamId.toString();
  }

  // For JSON serialization
  toJSON() {
    return {
      assetId: this.assetId,
      originalTeamId: this.originalTeamId,
      currentTeamId: this.currentTeamId,
      round: this.round,
      pickInRound: this.pickInRound,
      overallPick: this.overallPick,
      tradeHistory: this.tradeHistory
    };
  }

  // For JSON deserialization
  static fromJSON(json) {
    const pick = new DraftPick(json.originalTeamId, json.overallPick - 1);
    pick.currentTeamId = json.currentTeamId;
    pick.tradeHistory = json.tradeHistory;
    return pick;
  }
}

// Generate snake draft order for multiple rounds
export function generateDraftOrder() {
  const draftOrder = [];
  const teamIds = Array.from({ length: TEAMS_PER_ROUND }, (_, i) => i + 1);

  let pickIndex = 0;
  for (let round = 0; round < TOTAL_ROUNDS; round++) {
    // For even rounds, reverse the order (snake draft)
    const roundOrder = round % 2 === 0 ? [...teamIds] : [...teamIds].reverse();
    
    for (const teamId of roundOrder) {
      draftOrder.push(new DraftPick(teamId, pickIndex++));
    }
  }

  return draftOrder;
}

// Default draft order
export const defaultDraftOrder = generateDraftOrder();
