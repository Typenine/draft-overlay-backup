import React, { useState, useEffect, useCallback, useRef } from 'react';
import { teams } from '../teams';
import styles from './OverlayDisplay.module.css';
import ClockBox from './OverlayDisplay/ClockBox/ClockBox';
import { InfoBar } from './OverlayDisplay/InfoBar/InfoBar';
import Ticker from './OverlayDisplay/Ticker/Ticker';
import AnimationLayer from './OverlayDisplay/AnimationLayer/AnimationLayer';
import { defaultDraftOrder } from '../draftOrder';
import { loadState } from '../utils/storage';

const findTeamById = (id) => teams.find(team => team.id === id);

export default function OverlayDisplay() {
  // Initialize state from localStorage or defaults
  const savedState = loadState();
  const [currentTeamId, setCurrentTeamId] = useState(savedState?.draftOrder?.[savedState?.currentPickIndex] ?? 1);
  const [currentPickIndex, setCurrentPickIndex] = useState(savedState?.currentPickIndex ?? 0);
  const [timerSeconds, setTimerSeconds] = useState(savedState?.timerSeconds ?? 120);
  const [isTimerRunning, setIsTimerRunning] = useState(savedState?.isTimerRunning ?? false);
  const [draftOrder, setDraftOrder] = useState(savedState?.draftOrder ?? defaultDraftOrder);
  const [recentDraftedPlayer, setRecentDraftedPlayer] = useState(null);
  const [lastPickTimestamp, setLastPickTimestamp] = useState(Date.now());
  const channelRef = useRef(null);

  // Effect to clear the drafted player after 10 seconds
  useEffect(() => {
    if (recentDraftedPlayer) {
      const currentTimestamp = Date.now();
      setLastPickTimestamp(currentTimestamp);
      
      const timer = setTimeout(() => {
        // Only clear if this is still the most recent pick
        if (lastPickTimestamp === currentTimestamp) {
          setRecentDraftedPlayer(null);
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [recentDraftedPlayer, lastPickTimestamp]);

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
          setRecentDraftedPlayer({
            player: newSelectedPlayer,
            team: draftingTeam
          });
        } else {
          // If selectedPlayer is null, clear the recent draft
          setRecentDraftedPlayer(null);
          console.log('[Message] Clearing recent draft display');
        }
      } 
      else if (event.data.type === 'STATE_UPDATE') {
        const { currentTeamId, currentPickIndex, timerSeconds, isTimerRunning, draftOrder: newDraftOrder } = event.data.payload;
        
        // Batch all state updates in a single React cycle
        React.startTransition(() => {
          // Update draft order first since other state might depend on it
          if (newDraftOrder) {
            setDraftOrder(newDraftOrder);
          }
          
          // Update all other state
          setCurrentTeamId(currentTeamId);
          setCurrentPickIndex(currentPickIndex);
          setTimerSeconds(timerSeconds);
          setIsTimerRunning(isTimerRunning);
        });
      }
    };

    channelRef.current.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      channelRef.current.removeEventListener('message', handleMessage);
      channelRef.current.close();
    };
  }, [findTeamById, draftOrder]);

  // Find current team
  const currentTeam = teams.find(team => team.id === currentTeamId) || teams[0];
  const [primaryColor, secondaryColor] = currentTeam.colors;

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
        animations={{
          draft: recentDraftedPlayer,
          onClock: null,
          trade: null
        }}
        onAnimationComplete={(type) => {
          if (type === 'draft') setRecentDraftedPlayer(null);
        }}
      />
      {/* Ticker component temporarily hidden
      <Ticker />
      */}
    </div>
  );
}
