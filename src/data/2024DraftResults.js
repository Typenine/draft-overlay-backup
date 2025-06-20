import { teams } from '../teams';

// Create a mapping of team names to IDs for data conversion
const teamNameToId = {};
teams.forEach(team => {
  teamNameToId[team.name] = team.id;
});

export const draft2024 = [
  { teamId: 3, team: "Mt. Lebanon Cake Eaters", round: 1, pick: 1, overall: "1st", player: "Caleb Williams", position: "QB", college: "USC", nflTeam: "CHI" },
  { teamId: 11, team: "Bimg Bamg Boomg", round: 1, pick: 2, overall: "2nd", player: "Marvin Harrison Jr.", position: "WR", college: "Ohio State", nflTeam: "ARI" },
  { teamId: 1, team: "Belltown Raptors", round: 1, pick: 3, overall: "3rd", player: "Malik Nabers", position: "WR", college: "LSU", nflTeam: "NYG" },
  { teamId: 5, team: "The Lone Ginger", round: 1, pick: 4, overall: "4th", player: "Jayden Daniels", position: "QB", college: "LSU", nflTeam: "WAS" },
  { teamId: 5, team: "The Lone Ginger", round: 1, pick: 5, overall: "5th", player: "Rome Odunze", position: "WR", college: "Washington", nflTeam: "CHI" },
  { teamId: 2, team: "Frank Gore = HOF", round: 1, pick: 6, overall: "6th", player: "Brock Bowers", position: "TE", college: "Georgia", nflTeam: "LV" },
  { teamId: 6, team: "Minshew's Maniacs", round: 1, pick: 7, overall: "7th", player: "J.J. McCarthy", position: "QB", college: "Michigan", nflTeam: "MIN" },
  { teamId: 9, team: "bop pop", round: 1, pick: 8, overall: "8th", player: "Drake Maye", position: "QB", college: "UNC", nflTeam: "NE" },
  { teamId: 10, team: "BeerNeverBrokeMyHeart", round: 1, pick: 9, overall: "9th", player: "Brian Thomas Jr.", position: "WR", college: "LSU", nflTeam: "JAX" },
  { teamId: 12, team: "Detroit Dawgs", round: 1, pick: 10, overall: "10th", player: "Bo Nix", position: "QB", college: "Oregon", nflTeam: "DEN" },
  { teamId: 8, team: "Elemental Heroes", round: 1, pick: 11, overall: "11th", player: "Jonathon Brooks", position: "RB", college: "Texas", nflTeam: "CAR" },
  { teamId: 4, team: "Double Trouble", round: 1, pick: 12, overall: "12th", player: "Keon Coleman", position: "WR", college: "Florida State", nflTeam: "BUF" },
  { teamId: 3, team: "Mt. Lebanon Cake Eaters", round: 2, pick: 1, overall: "13th", player: "Xavier Worthy", position: "WR", college: "Texas", nflTeam: "KC" },
  { teamId: 3, team: "Mt. Lebanon Cake Eaters", round: 2, pick: 2, overall: "14th", player: "Blake Corum", position: "RB", college: "Michigan", nflTeam: "LAR" },
  { teamId: 11, team: "Bimg Bamg Boomg", round: 2, pick: 3, overall: "15th", player: "Trey Benson", position: "RB", college: "Florida State", nflTeam: "ARI" },
  { teamId: 7, team: "Red Pandas", round: 2, pick: 4, overall: "16th", player: "Ladd McConkey", position: "WR", college: "Georgia", nflTeam: "LAC" },
  { teamId: 2, team: "Frank Gore = HOF", round: 2, pick: 5, overall: "17th", player: "Adonai Mitchell", position: "WR", college: "Texas", nflTeam: "IND" },
  { teamId: 5, team: "The Lone Ginger", round: 2, pick: 6, overall: "18th", player: "Michael Penix Jr.", position: "QB", college: "Washington", nflTeam: "ATL" },
  { teamId: 6, team: "Minshew's Maniacs", round: 2, pick: 7, overall: "19th", player: "Xavier Legette", position: "WR", college: "South Carolina", nflTeam: "CAR" },
  { teamId: 1, team: "Belltown Raptors", round: 2, pick: 8, overall: "20th", player: "MarShawn Lloyd", position: "RB", college: "USC", nflTeam: "GB" },
  { teamId: 10, team: "BeerNeverBrokeMyHeart", round: 2, pick: 9, overall: "21st", player: "Ricky Pearsall", position: "WR", college: "Florida", nflTeam: "SF" },
  { teamId: 5, team: "The Lone Ginger", round: 2, pick: 10, overall: "22nd", player: "Ja'Lynn Polk", position: "WR", college: "Washington", nflTeam: "NE" },
  { teamId: 9, team: "bop pop", round: 2, pick: 11, overall: "23rd", player: "Jermaine Burton", position: "WR", college: "Alabama", nflTeam: "CIN" },
  { teamId: 2, team: "Frank Gore = HOF", round: 2, pick: 12, overall: "24th", player: "Roman Wilson", position: "WR", college: "Michigan", nflTeam: "PIT" },
  { teamId: 7, team: "Red Pandas", round: 3, pick: 1, overall: "25th", player: "49ers defense", position: "DEF", college: "N/A", nflTeam: "SF" },
  { teamId: 11, team: "Bimg Bamg Boomg", round: 3, pick: 2, overall: "26th", player: "Jalen McMillan", position: "WR", college: "Washington", nflTeam: "TB" },
  { teamId: 1, team: "Belltown Raptors", round: 3, pick: 3, overall: "27th", player: "Troy Franklin", position: "WR", college: "Oregon", nflTeam: "DEN" },
  { teamId: 2, team: "Frank Gore = HOF", round: 3, pick: 4, overall: "28th", player: "Audric Estimé", position: "RB", college: "Notre Dame", nflTeam: "DEN" },
  { teamId: 6, team: "Minshew's Maniacs", round: 3, pick: 5, overall: "29th", player: "AJ Barner", position: "TE", college: "Michigan", nflTeam: "SEA" },
  { teamId: 5, team: "The Lone Ginger", round: 3, pick: 6, overall: "30th", player: "Ben Sinnott", position: "TE", college: "Kansas State", nflTeam: "WAS" },
  { teamId: 1, team: "Belltown Raptors", round: 3, pick: 7, overall: "31st", player: "Jaylen Wright", position: "RB", college: "Tennessee", nflTeam: "MIA" },
  { teamId: 9, team: "bop pop", round: 3, pick: 8, overall: "32nd", player: "Javon Baker", position: "WR", college: "UCF", nflTeam: "NE" },
  { teamId: 10, team: "BeerNeverBrokeMyHeart", round: 3, pick: 9, overall: "33rd", player: "Ray Davis", position: "RB", college: "Kentucky", nflTeam: "BUF" },
  { teamId: 11, team: "Bimg Bamg Boomg", round: 3, pick: 10, overall: "34th", player: "Ravens defense", position: "DEF", college: "N/A", nflTeam: "BAL" },
  { teamId: 8, team: "Elemental Heroes", round: 3, pick: 11, overall: "35th", player: "Kimani Vidal", position: "RB", college: "Troy", nflTeam: "LAC" },
  { teamId: 10, team: "BeerNeverBrokeMyHeart", round: 3, pick: 12, overall: "36th", player: "New York Jets", position: "DEF", college: "N/A", nflTeam: "NYJ" },
  { teamId: 7, team: "Red Pandas", round: 4, pick: 1, overall: "37th", player: "Tyrone Tracy Jr.", position: "RB", college: "Purdue", nflTeam: "NYG" },
  { teamId: 11, team: "Bimg Bamg Boomg", round: 4, pick: 2, overall: "38th", player: "Isaac Guerendo", position: "RB", college: "Louisville", nflTeam: "SF" },
  { teamId: 1, team: "Belltown Raptors", round: 4, pick: 3, overall: "39th", player: "Dallas Cowboys", position: "DEF", college: "N/A", nflTeam: "DAL" },
  { teamId: 5, team: "The Lone Ginger", round: 4, pick: 4, overall: "40th", player: "Brenden Rice", position: "WR", college: "USC", nflTeam: "LAC" },
  { teamId: 11, team: "Bimg Bamg Boomg", round: 4, pick: 5, overall: "41st", player: "Will Shipley", position: "RB", college: "Clemson", nflTeam: "PHI" },
  { teamId: 3, team: "Mt. Lebanon Cake Eaters", round: 4, pick: 6, overall: "42nd", player: "Pittsburgh Defense", position: "DEF", college: "N/A", nflTeam: "PIT" },
  { teamId: 2, team: "Frank Gore = HOF", round: 4, pick: 7, overall: "43rd", player: "Browns Defense", position: "DEF", college: "N/A", nflTeam: "CLE" },
  { teamId: 9, team: "bop pop", round: 4, pick: 8, overall: "44th", player: "Bucky Irving", position: "RB", college: "Oregon", nflTeam: "TB" },
  { teamId: 10, team: "BeerNeverBrokeMyHeart", round: 4, pick: 9, overall: "45th", player: "Luke McCaffrey", position: "WR", college: "Rice", nflTeam: "WAS" },
  { teamId: 12, team: "Detroit Dawgs", round: 4, pick: 10, overall: "46th", player: "Kansas City Defense", position: "DEF", college: "N/A", nflTeam: "KC" },
  { teamId: 8, team: "Elemental Heroes", round: 4, pick: 11, overall: "47th", player: "Chicago Bears Defense", position: "DEF", college: "N/A", nflTeam: "CHI" },
  { teamId: 4, team: "Double Trouble", round: 4, pick: 12, overall: "48th", player: "Eagles Defense", position: "DEF", college: "N/A", nflTeam: "PHI" }
];
