import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teams } from '../../../teams';
import styles from './DraftBoard.module.css';

const DraftBoard = ({ draftOrder, currentPickIndex }) => {
  const [draftGrid, setDraftGrid] = useState(Array(48).fill(null)); // 12 picks × 4 rounds
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('draft-overlay');
    
    const handleMessage = (event) => {
      const { type, payload } = event.data;
      
      if (type === 'PLAYER_DRAFTED') {
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
        const { pickIndex } = payload;
        setDraftGrid(prev => {
          const newGrid = [...prev];
          newGrid[pickIndex] = null;
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
                  className={`${styles.cell} ${isCurrentPick ? styles.currentPick : ''}`}
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
