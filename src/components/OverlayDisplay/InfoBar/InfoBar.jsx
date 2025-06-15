import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InfoBar.module.css';
import { draft2024 } from '../../../data/2024DraftResults';
import { draftPlayers } from '../../../draftPlayers';
import teamInfo2024 from '../../../data/teamInfo2024.json';
import { teams } from '../../../teams';



const BestAvailableView = () => {
  // Use the actual players array as source of truth
  const [localPlayers, setLocalPlayers] = React.useState(draftPlayers);

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
          setLocalPlayers(prev => prev.map(p => 
            p.name === selectedPlayer.name ? { ...p, drafted: true } : p
          ));
        }
      } else if (type === 'UNDO_PICK') {
        const { player } = payload;
        if (player) {
          setLocalPlayers(prev => prev.map(p => 
            p.name === player.name ? { ...p, drafted: false } : p
          ));
        }
      } else if (type === 'STATE_UPDATE' && payload?.players) {
        setLocalPlayers(payload.players);
      } else if (type === 'DRAFT_RESET') {
        setLocalPlayers(draftPlayers);
      } else if (type === 'PLAYERPOOL_RESET' && payload?.players) {
        setLocalPlayers(payload.players);
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

const Draft2024View = ({ initialTeamId }) => {
  const [currentTeamId, setCurrentTeamId] = useState(initialTeamId);
  const [teamPicks, setTeamPicks] = useState([]);
  const channelRef = useRef(null);

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
          <div
            key="no-picks"
          >
            No picks yet
          </div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={styles.draft2024}>
      <div className={styles.viewTitle}>2024 Draft Picks</div>
      <AnimatePresence mode="wait">
        <div
          key="picks"
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
        </div>
      </AnimatePresence>
    </div>
  );
};

const getOrdinalSuffix = (n) => {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

const TeamInfoView = ({ currentTeamId: initialTeamId }) => {
  const [currentTeamId, setCurrentTeamId] = useState(initialTeamId);
  const channelRef = useRef(null);

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

  const currentTeam = teams.find(team => team.id === currentTeamId);
  if (!currentTeam) return null;

  const teamInfo = teamInfo2024.find(info => info.teamName.trim() === currentTeam.name.trim());
  if (!teamInfo) return null;

  return (
    <div className={styles.teamInfo}>
      <div className={styles.viewTitle}>Team Info</div>
      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <div className={styles.infoHeader}>Record</div>
          <div className={styles.infoHeader}>Points For</div>
          <div className={styles.infoHeader}>Points Against</div>
          <div className={styles.infoHeader}>Playoff Result</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoValue}>{teamInfo.record}</div>
          <div className={styles.infoValue}>
            {teamInfo.fptsFor}
            <span className={styles.rank}>{teamInfo.rankFptsFor}{getOrdinalSuffix(teamInfo.rankFptsFor)}</span>
          </div>
          <div className={styles.infoValue}>
            {teamInfo.fptsAgainst}
            <span className={styles.rank}>{teamInfo.rankFptsAgainst}{getOrdinalSuffix(teamInfo.rankFptsAgainst)}</span>
          </div>
          <div className={styles.infoValue}>{teamInfo.playoffResult}</div>
        </div>
      </div>
    </div>
  );
};

const InfoBar = ({ teamColors = ['#0076B6', '#B0B7BC'], currentTeamId }) => {
  const [currentView, setCurrentView] = useState('teamInfo');
  const channelRef = useRef(null);
  const cycleTimerRef = useRef(null);

  const startCycleLoop = useCallback(function cycle() {
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = setTimeout(() => {
      setCurrentView(prev => {
        if (prev === 'teamInfo') return 'bestAvailable';
        if (prev === 'bestAvailable') return 'draft2024';
        return 'teamInfo';
      });
      startCycleLoop(); // schedule next after current completes
    }, 10000);
  }, []);
  
  useEffect(() => {
    channelRef.current = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'TOGGLE_VIEW') {
        setCurrentView(payload.view);
        startCycleLoop(); // Reset timer after manual toggle
      }
    };

    channelRef.current.addEventListener('message', handleMessage);

    // Start initial cycle loop
    startCycleLoop();

    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
      }
    };
  }, [startCycleLoop]);

  return (
    <div 
      className={styles.infoBar}
      style={{
        '--team-primary-color': teamColors[0],
        '--team-secondary-color': teamColors[1],
        backgroundColor: teamColors[0]
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {currentView === 'bestAvailable' ? (
          <motion.div 
            key="best-available"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <BestAvailableView />
          </motion.div>
        ) : currentView === 'draft2024' ? (
          <motion.div 
            key="draft-picks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Draft2024View initialTeamId={currentTeamId} />
          </motion.div>
        ) : (
          <motion.div 
            key="team-info"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <TeamInfoView currentTeamId={currentTeamId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { InfoBar, InfoBarErrorBoundary };
