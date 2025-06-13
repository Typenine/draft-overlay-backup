import React, { useState, useEffect, useCallback, useRef } from 'react';
import { teams } from '../teams';
import styles from './OverlayDisplay.module.css';
import DraftBoard from './OverlayDisplay/DraftBoard/DraftBoard';
import ClockBox from './OverlayDisplay/ClockBox/ClockBox';
import { InfoBar } from './OverlayDisplay/InfoBar/InfoBar';
import AnimationLayer from './OverlayDisplay/AnimationLayer/AnimationLayer';
import { defaultDraftOrder } from '../draftOrder';
import { loadState } from '../utils/storage';

export default function OverlayDisplay() {
  // Initialize state from localStorage or defaults
  const savedState = loadState();
  const [currentTeamId, setCurrentTeamId] = useState(savedState?.draftOrder?.[savedState?.currentPickIndex] ?? 1);
  const [currentPickIndex, setCurrentPickIndex] = useState(savedState?.currentPickIndex ?? 0);
  const [timerSeconds, setTimerSeconds] = useState(savedState?.timerSeconds ?? 120);
  const [draftOrder, setDraftOrder] = useState(savedState?.draftOrder ?? defaultDraftOrder);
  const [animations, setAnimations] = useState({
    draft: null,
    onClock: null,
    trade: null
  });
  const channelRef = useRef(null);
  const lastTeamIdRef = useRef(currentTeamId);



  // Memoize team finding function to avoid stale closures
  const findTeamById = useCallback((id) => teams.find(t => t.id === id), []);

  useEffect(() => {
    // Initialize channel
    channelRef.current = new BroadcastChannel('draft-overlay');
    
    // Set up message listener
    const handleMessage = (event) => {
      console.log('[Message] Received message type:', event.data.type);
      
      if (event.data.type === 'PLAYER_DRAFTED') {
        const { selectedPlayer: newSelectedPlayer } = event.data.payload;
        if (newSelectedPlayer) {
          console.log('[Message] New player drafted:', newSelectedPlayer.name);
          
          // Find the drafting team and show the announcement
          const draftingTeam = findTeamById(draftOrder[newSelectedPlayer.pickIndex]);
          setAnimations(prev => ({
            ...prev,
            draft: {
            player: newSelectedPlayer,
            team: draftingTeam
          }}));
        } else {
          // If selectedPlayer is null, clear the recent draft
          setAnimations(prev => ({ ...prev, draft: null }));
          console.log('[Message] Clearing recent draft display');
        }
      } 
      else if (event.data.type === 'STATE_UPDATE') {
        const { currentTeamId: newTeamId, currentPickIndex, timerSeconds, draftOrder: newDraftOrder } = event.data.payload;
        
        // Batch all state updates in a single React cycle
        React.startTransition(() => {
          // Update draft order first since other state might depend on it
          if (newDraftOrder) {
            setDraftOrder(newDraftOrder);
          }
          
          // Update all other state
          setCurrentTeamId(newTeamId);
          setCurrentPickIndex(currentPickIndex);
          setTimerSeconds(timerSeconds);

          // Check if team changed and trigger onClock animation if needed
          const isTeamChanged = newTeamId !== lastTeamIdRef.current;
          const isNotDuringPick = !animations.draft;
          const isOnClockInactive = !animations.onClock;

          if (isTeamChanged && isNotDuringPick && isOnClockInactive) {
            const team = findTeamById(newTeamId);
            setAnimations(prev => ({
              ...prev,
              onClock: { team, isNextTeam: false }
            }));
          }

          // Update last known team ID
          lastTeamIdRef.current = newTeamId;
        });
      }
    };

    channelRef.current.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      channelRef.current.removeEventListener('message', handleMessage);
      channelRef.current.close();
    };
  }, [findTeamById, draftOrder, animations.draft, animations.onClock]);

  // Find current team
  const currentTeam = teams.find(team => team.id === currentTeamId) || teams[0];
  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get next teams
  const nextTeams = [
    findTeamById(draftOrder[currentPickIndex + 1]),
    findTeamById(draftOrder[currentPickIndex + 2])
  ].filter(Boolean);

  return (
    <div className={styles.overlay}>
      <div className={styles.draftBoardContainer}>
        <DraftBoard draftOrder={draftOrder} currentPickIndex={currentPickIndex} />
      </div>
      <div className={styles.topRow}>
        <ClockBox
          teamAbbrev={currentTeam?.name?.substring(0, 3).toUpperCase() || 'DET'}
          teamLogo={currentTeam?.logo || null}
          teamColors={currentTeam?.colors || ['#ffffff', '#ffffff']}
          roundNumber={Math.floor(currentPickIndex / 12) + 1}
          pickNumber={(currentPickIndex % 12) + 1}
          timeRemaining={formatTimeRemaining(timerSeconds)}
          nextTeams={nextTeams}
        />
        <InfoBar 
          teamColors={currentTeam?.colors || ['#ffffff', '#ffffff']} 
          currentTeamId={currentTeamId}
        />
      </div>
      <AnimationLayer
        animations={animations}
        currentPickIndex={currentPickIndex}
        onAnimationComplete={(type) => {
          if (type === 'draft') {
            // Clear draft animation
            setAnimations(prev => ({ ...prev, draft: null }));
            // Start onClock animation for current team
            const currentTeam = findTeamById(draftOrder[currentPickIndex]);
            if (currentTeam) {
              setAnimations(prev => ({ ...prev, onClock: { team: currentTeam, isNextTeam: false } }));
            }
          } else if (type === 'onClock') {
            // Clear onClock animation
            setAnimations(prev => ({ ...prev, onClock: null }));
          }
        }}
      />
      {/* Ticker component temporarily hidden
      <Ticker />
      */}
    </div>
  );
}
