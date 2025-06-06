import React, { useState, useEffect, useRef } from 'react';
import { teams } from '../teams';
import CountdownTimer from './CountdownTimer';
import { defaultDraftOrder } from '../draftOrder';
import { loadState } from '../utils/storage';

export default function OverlayDisplay() {
  // Initialize state from localStorage or defaults
  const savedState = loadState();
  const [currentTeamId, setCurrentTeamId] = useState(savedState?.draftOrder?.[savedState?.currentPickIndex] ?? 1);
  const [currentPickIndex, setCurrentPickIndex] = useState(savedState?.currentPickIndex ?? 0);
  const [timerSeconds, setTimerSeconds] = useState(savedState?.timerSeconds ?? 120);
  const [isTimerRunning, setIsTimerRunning] = useState(savedState?.isTimerRunning ?? false);
  const [draftOrder, setDraftOrder] = useState(savedState?.draftOrder ?? defaultDraftOrder);
  const [recentDraftedPlayer, setRecentDraftedPlayer] = useState(null);
  const [lastPickTimestamp, setLastPickTimestamp] = useState(0);
  const channelRef = useRef(null);

  // Effect to clear the drafted player after 10 seconds
  useEffect(() => {
    console.log('[Timer] recentDraftedPlayer changed:', 
      recentDraftedPlayer ? recentDraftedPlayer.player.name : 'null');
    
    if (recentDraftedPlayer) {
      console.log('[Timer] Starting 10s timer for:', recentDraftedPlayer.player.name);
      const timer = setTimeout(() => {
        console.log('[Timer] Time up - clearing:', recentDraftedPlayer.player.name);
        setRecentDraftedPlayer(null);
      }, 10000);
      
      return () => {
        console.log('[Timer] Cleanup called for:', recentDraftedPlayer.player.name);
        clearTimeout(timer);
      };
    }
  }, [recentDraftedPlayer]);

  // Get next two teams
  const nextTeams = [
    teams.find(team => team.id === draftOrder[currentPickIndex + 1]),
    teams.find(team => team.id === draftOrder[currentPickIndex + 2])
  ].filter(Boolean); // Remove undefined values

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
          const draftingTeam = teams.find(t => t.id === draftOrder[newSelectedPlayer.pickIndex]);
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
        const { currentTeamId, currentPickIndex, timerSeconds, isTimerRunning, draftOrder: newDraftOrder, selectedPlayer: newSelectedPlayer } = event.data.payload;
        setCurrentTeamId(currentTeamId);
        setCurrentPickIndex(currentPickIndex);
        setTimerSeconds(timerSeconds);
        setIsTimerRunning(isTimerRunning);
        if (newDraftOrder) {
          setDraftOrder(newDraftOrder);
        }
        // For regular state updates, just update the state
        // but don't show player announcements
      }
    };

    channelRef.current.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      channelRef.current.removeEventListener('message', handleMessage);
      channelRef.current.close();
    };
  }, []);

  // Find current team
  const currentTeam = teams.find(team => team.id === currentTeamId) || teams[0];
  const [primaryColor, secondaryColor] = currentTeam.colors;

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center" 
         style={{ 
           background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.95))`
         }}>
      <div className="text-center p-6 rounded-xl bg-black bg-opacity-50 backdrop-blur-sm shadow-2xl border border-gray-800 max-h-screen overflow-hidden">
        {/* Draft Progress */}
        <div className="mb-8 text-gray-300">
          <div className="text-2xl font-bold">
            Round {Math.floor(currentPickIndex / 12) + 1}
            <span className="mx-2">•</span>
            Pick {(currentPickIndex % 12) + 1}
          </div>
        </div>

        {/* Current Team */}
        <img 
          src={currentTeam.logo} 
          alt={`${currentTeam.name} logo`}
          className="w-40 h-40 mx-auto mb-4 drop-shadow-2xl"
        />
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          {currentTeam.name}
        </h1>
        <h2 
          className="text-xl mb-6"
          style={{ color: secondaryColor }}
        >
          {currentTeam.owner}
        </h2>
        <CountdownTimer 
          seconds={timerSeconds}
          isRunning={isTimerRunning}
        />

        {/* Draft Announcement */}
        {recentDraftedPlayer && (
          <div 
            className="mt-6 pt-6 border-t border-gray-700 transition-all duration-1000 opacity-100"
            style={{
              animation: 'fadeInOut 10s ease-in-out'
            }}
          >
            <div 
              className="text-2xl font-bold" 
              style={{ color: recentDraftedPlayer.team.colors[0] }}
            >
              {recentDraftedPlayer.team.name} selects:
            </div>
            <div className="mt-4 text-3xl font-bold text-white">
              {recentDraftedPlayer.player.name}
            </div>
            <div className="mt-2 text-xl text-gray-300">
              {recentDraftedPlayer.player.position} - {recentDraftedPlayer.player.nflTeam}
            </div>
          </div>
        )}

        {/* Next Teams */}
        {nextTeams.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-xl font-semibold text-gray-400 mb-6">Next Up</h3>
            <div className="flex justify-center gap-8">
              {nextTeams.map((team, index) => (
                <div key={team.id} className="text-center opacity-80 hover:opacity-100 transition-opacity">
                  <img 
                    src={team.logo} 
                    alt={`${team.name} logo`}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <div className="text-sm font-medium" style={{ color: team.colors[0] }}>
                    {team.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {team.owner}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
