import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InfoBar.module.css';
import { draft2024 } from '../../../data/2024DraftResults';
import { draftPlayers } from '../../../draftPlayers';
import { teams } from '../../../teams';

const BestAvailableView = () => {
  // Use the actual players array as source of truth
  const [localPlayers, setLocalPlayers] = React.useState(draftPlayers);
  const updateTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Debounced update function
  const debouncedUpdate = (newPlayers) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      setLocalPlayers(newPlayers);
    }, 100); // 100ms debounce
  };

  React.useEffect(() => {
    const channel = new BroadcastChannel('draft-overlay');
    let isMounted = true;
    
    const handleMessage = (event) => {
      const { type, payload } = event.data;
      
      // Only process messages if component is mounted and visible
      if (!isMounted) return;
      
      if (type === 'PLAYER_DRAFTED') {
        const { selectedPlayer } = payload;
        if (selectedPlayer) {
          debouncedUpdate(prev => prev.map(p => 
            p.name === selectedPlayer.name ? { ...p, drafted: true } : p
          ));
        }
      } else if (type === 'UNDO_PICK') {
        const { player } = payload;
        if (player) {
          debouncedUpdate(prev => prev.map(p => 
            p.name === player.name ? { ...p, drafted: false } : p
          ));
        }
      } else if (type === 'STATE_UPDATE' && payload?.players) {
        debouncedUpdate(payload.players);
      } else if (type === 'DRAFT_RESET') {
        debouncedUpdate(draftPlayers);
      } else if (type === 'PLAYERPOOL_RESET' && payload?.players) {
        debouncedUpdate(payload.players);
      }
    };

    channel.addEventListener('message', handleMessage);
    channel.postMessage({ type: 'REQUEST_STATE' });

    return () => {
      isMounted = false;
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  const availablePlayers = localPlayers
    .filter(player => !player.drafted && player.position !== "DEF")
    .sort((a, b) => a.overallRank - b.overallRank);
    
  console.log('[BestAvailable] Filtered players:', 
    'Total:', localPlayers.length,
    'Available:', availablePlayers.length);

  const visiblePlayers = availablePlayers.slice(0, 6);

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
                {player.position} - {player.college} - {player.nflTeam || '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

class InfoBarErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('InfoBar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            Something went wrong displaying the InfoBar.
            Please refresh the page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
const getNFLTeamAbbreviation = (teamName) => {
  const abbreviations = {
    'Arizona Cardinals': 'ARI',
    'Atlanta Falcons': 'ATL',
    'Baltimore Ravens': 'BAL',
    'Buffalo Bills': 'BUF',
    'Carolina Panthers': 'CAR',
    'Chicago Bears': 'CHI',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Dallas Cowboys': 'DAL',
    'Denver Broncos': 'DEN',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Miami Dolphins': 'MIA',
    'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE',
    'New Orleans Saints': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Philadelphia Eagles': 'PHI',
    'Pittsburgh Steelers': 'PIT',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
    'Tampa Bay Buccaneers': 'TB',
    'Tennessee Titans': 'TEN',
    'Washington Commanders': 'WAS'
  };
  return abbreviations[teamName] || teamName;
};

const Draft2024View = ({ parentIsTransitioning, initialTeamId }) => {
  const [currentTeamId, setCurrentTeamId] = useState(initialTeamId);
  const [teamPicks, setTeamPicks] = useState([]);
  const channelRef = useRef(null);

  // Single source of truth for BroadcastChannel
  useEffect(() => {
    channelRef.current = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'STATE_UPDATE' && payload?.currentTeamId) {
        setCurrentTeamId(payload.currentTeamId);
      } else if (type === 'DRAFT_RESET') {
        setCurrentTeamId(1);
      }
    };

    channelRef.current.addEventListener('message', handleMessage);
    channelRef.current.postMessage({ type: 'REQUEST_STATE' });

    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
    };
  }, []);

  // Update team picks when currentTeamId changes
  useEffect(() => {
    if (!currentTeamId) return;
    
    const newTeamPicks = draft2024
      .filter(pick => pick.teamId === currentTeamId)
      .sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return a.pick - b.pick;
      });
    
    setTeamPicks(newTeamPicks);
  }, [currentTeamId]);

  const visiblePicks = teamPicks.slice(0, 6);

  if (teamPicks.length === 0) {
    return (
      <div className={styles.draft2024}>
        <div className={styles.viewTitle}>2024 Draft Picks</div>
        <AnimatePresence mode="wait">
          <motion.div
            key="no-picks"
            initial={{ opacity: 0, y: 40 }}
            animate={{ 
              opacity: 1,
              y: 0,
              transition: {
                y: { type: "spring", stiffness: 70, damping: 15 },
                opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
              }
            }}
            exit={{ 
              opacity: 0,
              y: -40,
              transition: {
                y: { duration: 0.6, ease: [0.4, 0, 0.6, 1] },
                opacity: { duration: 0.5, ease: "linear" }
              }
            }}
          >
            No picks yet
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={styles.draft2024}>
      <div className={styles.viewTitle}>2024 Draft Picks</div>
      <AnimatePresence mode="wait">
        <motion.div
          key="picks"
          initial={{ 
            opacity: 0,
            y: 40 
          }}
          animate={{ 
            opacity: 1,
            y: 0,
            transition: {
              y: { type: "spring", stiffness: 70, damping: 15 },
              opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            }
          }}
          exit={{ 
            opacity: 0,
            y: -40,
            transition: {
              y: { duration: 0.6, ease: [0.4, 0, 0.6, 1] },
              opacity: { duration: 0.5, ease: "linear" }
            }
          }}
        >
          <div className={styles.playerList}>
            {visiblePicks.map((pick, i) => (
              <div key={`${pick.round}-${pick.pick}`} className={styles.playerCard}>
                <div className={styles.rank}>{i + 1}.</div>
                <div className={styles.playerInfo}>
                  <div className={styles.playerName}>{pick.player}</div>
                  <div className={styles.playerDetails}>
                    {pick.position} - {pick.nflTeam || '-'} - Round {pick.round}, Pick {pick.pick}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
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

// Shared animation configuration
const animationConfig = {
  initial: { opacity: 0, y: 40 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      y: { type: "spring", stiffness: 70, damping: 15 },
      opacity: { duration: 0.3 } // Faster opacity transition
    }
  },
  exit: { 
    opacity: 0,
    y: -40,
    transition: {
      y: { duration: 0.3 }, // Match opacity duration
      opacity: { duration: 0.3 }
    }
  }
};

const InfoBar = ({ teamColors = ['#0076B6', '#B0B7BC'], currentTeamId }) => {
  const [currentView, setCurrentView] = useState('bestAvailable');
  const channelRef = useRef(null);
  
  // Ref to track if we're transitioning
  const isTransitioning = useRef(false);
  
  // Simple 10-second view alternation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning.current) {
        setCurrentView(current => 
          current === 'bestAvailable' ? 'draftPicks' : 'bestAvailable'
        );
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle broadcast messages
  useEffect(() => {
    channelRef.current = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'TOGGLE_VIEW') {
        setCurrentView(payload.view);
      }
    };

    channelRef.current.addEventListener('message', handleMessage);
    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
    };
  }, []);




  const onAnimationStart = () => {
    isTransitioning.current = true;
  };

  const onAnimationComplete = () => {
    isTransitioning.current = false;
  };

  return (
    <div 
      className={styles.infoBar}
      style={{
        '--team-primary-color': teamColors[0],
        '--team-secondary-color': teamColors[1]
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {currentView === 'bestAvailable' ? (
          <motion.div
            key="best-available"
            {...animationConfig}
            onAnimationStart={onAnimationStart}
            onAnimationComplete={onAnimationComplete}
          >
            <BestAvailableView />
          </motion.div>
        ) : (
          <motion.div
            key="draft-picks"
            {...animationConfig}
            onAnimationStart={onAnimationStart}
            onAnimationComplete={onAnimationComplete}
          >
            <Draft2024View initialTeamId={currentTeamId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { InfoBar, InfoBarErrorBoundary };
