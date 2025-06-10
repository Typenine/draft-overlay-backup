import React, { useState, useEffect } from 'react';
import styles from './InfoBar.module.css';
import { draft2024 } from '../../../data/2024DraftResults';
import { draftPlayers } from '../../../draftPlayers';
import { teams } from '../../../teams';

class InfoBarErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div className={styles.infoBar}>Error loading draft info</div>;
    }
    return this.props.children;
  }
}

const getNFLTeamAbbreviation = (teamName) => {
  const abbreviations = {
    "Tennessee Titans": "TEN",
    "Jacksonville Jaguars": "JAX",
    "Las Vegas Raiders": "LV",
    "Carolina Panthers": "CAR",
    "Chicago Bears": "CHI",
    "Indianapolis Colts": "IND",
    "Tampa Bay Buccaneers": "TB",
    "Los Angeles Chargers": "LAC",
    "Green Bay Packers": "GB",
    "New York Giants": "NYG",
    "Houston Texans": "HOU",
    "Cleveland Browns": "CLE",
    "New England Patriots": "NE",
    "New Orleans Saints": "NO",
    "New York Jets": "NYJ",
    "Los Angeles Rams": "LAR",
    "Pittsburgh Steelers": "PIT",
    "Dallas Cowboys": "DAL",
    "Buffalo Bills": "BUF",
    "Detroit Lions": "DET",
    "Denver Broncos": "DEN",
    "Minnesota Vikings": "MIN",
    "Washington Commanders": "WAS",
    "Kansas City Chiefs": "KC",
    "Seattle Seahawks": "SEA",
    "Atlanta Falcons": "ATL",
    "Arizona Cardinals": "ARI",
    "Miami Dolphins": "MIA",
    "Cincinnati Bengals": "CIN",
    "San Francisco 49ers": "SF",
    "Philadelphia Eagles": "PHI",
    "Baltimore Ravens": "BAL"
  };
  return abbreviations[teamName] || teamName;
};

const BestAvailableView = () => {
  // Use the actual players array as source of truth
  const [localPlayers, setLocalPlayers] = useState(draftPlayers);

  useEffect(() => {
    const channel = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      try {
        if (!event.data || !event.data.type) {
          console.error('Received malformed message:', event);
          return;
        }

        switch (event.data.type) {
          case 'STATE_UPDATE':
            // If we get a state update with players, sync with admin panel
            const { players: updatedPlayers } = event.data.payload;
            if (updatedPlayers) {
              console.log('Received player update:', updatedPlayers.filter(p => !p.drafted).length, 'available');
              setLocalPlayers(updatedPlayers);
            }
            break;

          case 'PLAYER_DRAFTED':
            // For individual draft updates, mark that player as drafted
            const { selectedPlayer } = event.data.payload;
            if (selectedPlayer) {
              setLocalPlayers(prev => prev.map(p => 
                p.name === selectedPlayer.name ? { ...p, drafted: true } : p
              ));
            }
            break;

          case 'DRAFT_RESET':
            // Reset to initial state
            setLocalPlayers(draftPlayers);
            break;

          default:
            console.log('Unhandled message type:', event.data.type);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  const availablePlayers = localPlayers
    .filter(player => !player.drafted && player.position !== "DEF")
    .sort((a, b) => a.overallRank - b.overallRank);

  const visiblePlayers = availablePlayers.slice(0, 4);

  return (
    <div className={styles.bestAvailable}>
      <div className={styles.viewTitle}>Best Available</div>
      <div className={styles.playerList}>
        {visiblePlayers.map((player, index) => (
          <div key={player.overallRank} className={styles.playerCard}>
            <div className={styles.rank}>{index + 1}.</div>
            <div className={styles.playerInfo}>
              <div className={styles.playerName}>{player.name}</div>
              <div className={styles.playerDetails}>
                {player.position} - {player.college} - {getNFLTeamAbbreviation(player.nflTeam)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Draft2024View = () => {
  const [currentTeamId, setCurrentTeamId] = useState(1);

  useEffect(() => {
    const channel = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      try {
        if (!event.data || !event.data.type) {
          console.error('Received malformed message:', event);
          return;
        }

        switch (event.data.type) {
          case 'STATE_UPDATE':
            const { currentTeamId: newTeamId } = event.data.payload;
            if (newTeamId) {
              setCurrentTeamId(newTeamId);
            }
            break;

          case 'DRAFT_RESET':
            setCurrentTeamId(1);
            break;

          default:
            // No need to handle other message types
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  // Get the current team name from the teams array
  const currentTeamObj = teams.find(t => t.id === currentTeamId);
  const currentTeam = currentTeamObj?.name || 'Detroit Dawgs';

  // Debug logging
  console.log('Current Team ID:', currentTeamId);
  console.log('Current Team Object:', currentTeamObj);
  console.log('Current Team Name:', currentTeam);
  console.log('Available Teams in draft2024:', [...new Set(draft2024.map(p => p.team))]);

  // Create a mapping between team names in teams.js and draft2024.js
  const teamNameMap = {
    "Belltown Raptors": "Belltown Raptors",
    "Frank Gore = HOF": "Frank Gore = HOF",
    "Mt. Lebanon Cake Eaters": "Mt. Lebanon Cake Eaters",
    "Double Trouble": "Double Trouble",
    "The Lone Ginger": "The Lone Ginger",
    "Minshew's Maniacs": "Minshew's Maniacs",
    "Red Pandas": "Red Pandas",
    "Elemental Heroes": "Elemental Heroes",
    "bop pop": "bop pop",
    "BeerNeverBrokeMyHeart": "BeerNeverBrokeMyHeart",
    "Bimg Bamg Boomg": "Bimg Bamg Boomg",
    "Detroit Dawgs": "Detroit Dawgs"
  };

  // Filter picks for the current team and sort by round/pick
  const teamPicks = draft2024
    .filter(pick => pick.team === teamNameMap[currentTeam])
    .sort((a, b) => a.round - b.round || a.pick - b.pick);
  
  console.log('Found picks for team:', teamPicks);
  
  // Show first 4 picks or error if none found
  const visiblePicks = teamPicks.slice(0, 4);

  if (teamPicks.length === 0) {
    return (
      <div className={styles.bestAvailable}>
        <div className={styles.viewTitle}>2024 Draft Picks</div>
        <div className={styles.playerList}>
          <div className={styles.playerCard}>
            <div className={styles.playerInfo}>
              <div className={styles.playerName}>No picks found</div>
              <div className={styles.playerDetails}>This team has no draft picks</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bestAvailable}>
      <div className={styles.viewTitle}>2024 Draft Picks</div>
      <div className={styles.playerList}>
        {visiblePicks.map((pick, index) => (
          <div key={`${pick.round}-${pick.pick}`} className={styles.playerCard}>
            <div className={styles.rank}>{index + 1}.</div>
            <div className={styles.playerInfo}>
              <div className={styles.playerName}>{pick.player}</div>
              <div className={styles.playerDetails}>
                {pick.position} - {pick.nflTeam} - Round {pick.round}, Pick {pick.pick}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const validateData = () => {
  try {
    return (
      Array.isArray(teams) && teams.length > 0 &&
      Array.isArray(draftPlayers) && draftPlayers.length > 0 &&
      Array.isArray(draft2024) && draft2024.length > 0
    );
  } catch (error) {
    console.error('Data validation error:', error);
    return false;
  }
};

const InfoBar = ({ teamColors = ['#0076B6', '#B0B7BC'] }) => {
  const [showBestAvailable, setShowBestAvailable] = useState(true);

  useEffect(() => {
    const channel = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      try {
        if (!event.data || !event.data.type) return;

        if (event.data.type === 'TOGGLE_VIEW') {
          setShowBestAvailable(event.data.payload.showBestAvailable);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  return (
    <div 
      className={styles.infoBar}
      style={{
        '--team-primary-color': teamColors[0],
        '--team-secondary-color': teamColors[1]
      }}
    >
      {showBestAvailable ? <BestAvailableView /> : <Draft2024View />}
    </div>
  );
};

export default InfoBar;
