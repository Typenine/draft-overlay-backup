import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teams } from '../../../teams';
import styles from './DraftBoard.module.css';
import { loadState } from '../../../utils/storage';

const positionColors = {
  'QB': '#C00000',
  'RB': '#FFC000',
  'WR': '#0070C0',
  'TE': '#00B050',
  'DEF': '#7030A0',
  'K': '#FF8C42'
};

const DraftBoard = ({ draftOrder }) => {
  // Load initial state from localStorage
  const savedState = loadState();
  const [currentPickIndex, setCurrentPickIndex] = useState(savedState?.currentPickIndex ?? 0);
  
  // Initialize draftGrid from draftHistory
  const initialGrid = Array(48).fill(null);
  if (savedState?.draftHistory) {
    savedState.draftHistory.forEach((pick, index) => {
      if (pick) {
        initialGrid[index] = {
          player: pick.name,
          position: pick.position,
          team: draftOrder[index]
        };
      }
    });
  }
  const [draftGrid, setDraftGrid] = useState(initialGrid);
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      const { type, payload } = event.data;
      
      if (type === 'STATE_UPDATE') {
        // Update currentPickIndex when state changes
        setCurrentPickIndex(payload.currentPickIndex);
      } else if (type === 'PLAYER_DRAFTED') {
        const { selectedPlayer, pickIndex } = payload;
        if (selectedPlayer) {
          setDraftGrid(prev => {
            const newGrid = [...prev];
            newGrid[pickIndex] = {
              player: selectedPlayer.name,
              position: selectedPlayer.position,
              team: draftOrder[pickIndex]
            };
            return newGrid;
          });
        }
      } else if (type === 'UNDO_PICK') {
        // For undo, we only clear the specified pick
        const { pickIndex } = payload;
        setDraftGrid(prev => {
          const newGrid = [...prev];
          // Only clear if there's actually something at this index
          if (newGrid[pickIndex]) {
            newGrid[pickIndex] = null;
          }
          return newGrid;
        });
      } else if (type === 'DRAFT_RESET') {
        setDraftGrid(Array(48).fill(null));
      }
    };

    channelRef.current.addEventListener('message', handleMessage);
    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
    };
  }, [draftOrder]);

  // Get team logo by team ID
  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logo || '';
  };

  // Get team by ID
  const getTeam = (teamId) => {
    return teams.find(t => t.id === teamId);
  };

  return (
    <div className={styles.draftBoardContainer}>
      <div className={styles.grid}>
        {/* Pick Numbers Column */}
        <div className={styles.pickColumn}>
          <div className={styles.headerCell}>Pick</div>
          {[...Array(12)].map((_, i) => (
            <div 
              key={`pick-${i + 1}`}
              className={`${styles.pickCell} ${currentPickIndex % 12 === i ? styles.currentPick : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Round Columns */}
        {[1, 2, 3, 4].map(round => (
          <div key={`round-${round}`} className={styles.roundColumn}>
            <div className={styles.headerCell}>Round {round}</div>
            {[...Array(12)].map((_, pickIndex) => {
              const gridIndex = (round - 1) * 12 + pickIndex;
              const pick = draftGrid[gridIndex];
              const teamId = draftOrder[gridIndex];
              const isCurrentPick = currentPickIndex === gridIndex;

              return (
                <div 
                  key={`r${round}p${pickIndex + 1}`}
                  className={`${styles.cell} ${pick ? styles.filledCell : ''} ${isCurrentPick ? styles.currentPick : ''}`}
                  style={{
                    '--team-primary-color': pick ? getTeam(teamId)?.colors[0] : 'rgba(0, 0, 0, 0.6)',
                    '--team-secondary-color': pick ? getTeam(teamId)?.colors[1] : 'rgba(0, 0, 0, 0.6)',
                    '--team-tertiary-color': pick ? getTeam(teamId)?.colors[2] || getTeam(teamId)?.colors[1] : 'rgba(0, 0, 0, 0.6)',
                    '--position-color': pick ? positionColors[pick.position] : undefined
                  }}
                >
                  <div className={styles.teamLogo}>
                    <img 
                      src={getTeamLogo(teamId)} 
                      alt="" 
                      className={styles.logo}
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    {pick && (
                      <motion.div
                        key={`pick-${gridIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={styles.playerInfo}
                      >
                        <span className={styles.playerName}>{pick.player}</span>
                        <span className={styles.position}>{pick.position}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftBoard;
