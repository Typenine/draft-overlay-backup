import React, { useState, useEffect, useRef, useCallback } from 'react';
import { teams } from '../teams';
import { defaultDraftOrder, TOTAL_ROUNDS, TEAMS_PER_ROUND } from '../draftOrder';
import { 
  loadState, 
  saveState, 
  saveDefaultDraftOrder, 
  loadDefaultDraftOrder,
  loadDefaultTimerDuration,
  saveDefaultTimerDuration
} from '../utils/storage';

export default function AdminPanel() {
  // Initialize state from localStorage or defaults
  const savedState = loadState();
  const savedDefaultDuration = loadDefaultTimerDuration() || 120;

  // Core draft state
  const [currentPickIndex, setCurrentPickIndex] = useState(savedState?.currentPickIndex ?? 0);
  const [draftOrder, setDraftOrder] = useState(savedState?.draftOrder ?? defaultDraftOrder);
  const [editableDraftOrder, setEditableDraftOrder] = useState([...(savedState?.draftOrder ?? defaultDraftOrder)]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(savedState?.timerSeconds ?? savedDefaultDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(savedState?.isTimerRunning ?? false);
  const [defaultDuration, setDefaultDuration] = useState(savedDefaultDuration);

  // UI state
  const [showEditor, setShowEditor] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs
  const channelRef = useRef(null);

  // Derive currentTeamId from draftOrder and currentPickIndex
  const currentTeamId = draftOrder[currentPickIndex] || 1;

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState({
      currentPickIndex,
      timerSeconds,
      isTimerRunning,
      draftOrder,
      defaultDuration
    });
  }, [currentPickIndex, timerSeconds, isTimerRunning, draftOrder, defaultDuration]);

  // Initialize channel
  useEffect(() => {
    channelRef.current = new BroadcastChannel('draft-overlay');
    return () => channelRef.current.close();
  }, []);

  // Broadcast state function
  const broadcastState = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'STATE_UPDATE',
        payload: {
          currentTeamId,
          currentPickIndex,
          timerSeconds,
          isTimerRunning,
          draftOrder
        }
      });
    }
  }, [currentTeamId, currentPickIndex, timerSeconds, isTimerRunning, draftOrder]);

  // Broadcast state whenever it changes
  useEffect(() => {
    broadcastState();
  }, [broadcastState]);

  const handleNextPick = useCallback(() => {
    if (currentPickIndex < draftOrder.length - 1) {
      setCurrentPickIndex(prev => prev + 1);
      setTimerSeconds(defaultDuration);
      setIsTimerRunning(true);
      broadcastState();
    }
  }, [currentPickIndex, draftOrder.length, defaultDuration, broadcastState]);

  const handlePreviousPick = useCallback(() => {
    if (currentPickIndex > 0) {
      setCurrentPickIndex(prev => prev - 1);
      setTimerSeconds(defaultDuration);
      setIsTimerRunning(false);
      broadcastState();
    }
  }, [currentPickIndex, defaultDuration, broadcastState]);

  // Timer effect with auto-advance
  useEffect(() => {
    let interval;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (currentPickIndex < draftOrder.length - 1) {
        handleNextPick();
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentPickIndex, draftOrder.length, handleNextPick]);

  const handleTimerToggle = () => {
    setIsTimerRunning(prev => !prev);
    broadcastState();
  };

  const handleTimerReset = () => {
    setTimerSeconds(defaultDuration);
    setIsTimerRunning(false);
    broadcastState();
  };

  const handleDraftOrderChange = (index, teamId) => {
    const newOrder = [...editableDraftOrder];
    newOrder[index] = Number(teamId);
    setEditableDraftOrder(newOrder);
    setErrorMessage('');
  };

  const validateAndApplyOrder = () => {
    setDraftOrder(editableDraftOrder);
    setShowEditor(false);
    setErrorMessage('');
    broadcastState();
  };

  const resetToDefault = async () => {
    const defaultOrder = await loadDefaultDraftOrder() || defaultDraftOrder;
    setEditableDraftOrder([...defaultOrder]);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8">
        <div className="space-y-8">
          {/* Header Section */}
          <header className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Draft Control Panel</h1>
            <p className="text-gray-600">Manage teams and control the draft timer</p>
          </header>

          {/* Current Team Section */}
          <section className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Current Team</h3>
            <div className="flex items-center space-x-4">
              <img 
                src={teams.find(t => t.id === currentTeamId)?.logo} 
                alt="Team logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <div className="text-xl font-bold text-gray-800">
                  {teams.find(t => t.id === currentTeamId)?.name}
                </div>
                <div className="text-gray-600">
                  {teams.find(t => t.id === currentTeamId)?.owner}
                </div>
              </div>
            </div>
          </section>

          {/* Draft Progress Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Draft Progress</h2>
              <div className="text-lg font-medium text-gray-600">
                Pick {currentPickIndex + 1} of {draftOrder.length}
                <span className="mx-2">|</span>
                Round {Math.floor(currentPickIndex / TEAMS_PER_ROUND) + 1} of {TOTAL_ROUNDS}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePreviousPick}
                disabled={currentPickIndex === 0}
                className={`flex-1 p-3 rounded-lg font-semibold text-lg transition-all ${currentPickIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105'}`}
              >
                ⬅️ Previous Pick
              </button>
              <button
                onClick={handleNextPick}
                disabled={currentPickIndex === draftOrder.length - 1}
                className={`flex-1 p-3 rounded-lg font-semibold text-lg transition-all ${currentPickIndex === draftOrder.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105'}`}
              >
                Next Pick ➡️
              </button>
            </div>
          </section>

          {/* Timer Controls */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Timer Controls</h2>
            
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-1 w-full sm:w-auto space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-600">Timer Duration:</label>
                  <select
                    value={defaultDuration}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value, 10);
                      setDefaultDuration(newDuration);
                      saveDefaultTimerDuration(newDuration);
                      if (!isTimerRunning) {
                        setTimerSeconds(newDuration);
                      }
                    }}
                    className="p-2 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="60">1 minute</option>
                    <option value="120">2 minutes</option>
                    <option value="180">3 minutes</option>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleTimerToggle}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium ${
                      isTimerRunning 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white shadow-lg transition-colors`}
                  >
                    {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                  </button>
                  <button
                    onClick={handleTimerReset}
                    className="flex-1 px-6 py-3 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white shadow-lg transition-colors"
                  >
                    Reset Timer
                  </button>
                </div>
              </div>
              
              <div className="text-4xl font-mono font-bold text-gray-800 bg-gray-50 px-6 py-3 rounded-lg shadow-inner min-w-[150px] text-center">
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </section>

          {/* Draft Order Editor */}
          <section className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Draft Order</h2>
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showEditor ? 'Hide Draft Order Editor' : 'Edit Draft Order'}
              </button>
            </div>

            {showEditor && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Draft Order Editor</h2>
                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        saveDefaultDraftOrder(editableDraftOrder);
                        setErrorMessage('Current order saved as default!');
                        setTimeout(() => setErrorMessage(''), 2000);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Set Current as Default
                    </button>
                    <button
                      onClick={resetToDefault}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Reset to Default
                    </button>
                    <button
                      onClick={validateAndApplyOrder}
                      className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Apply Order
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className={`mb-4 p-3 rounded ${
                    errorMessage.includes('saved as default') 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {Array.from({ length: TOTAL_ROUNDS }).map((_, roundIndex) => (
                    <div key={roundIndex} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Round {roundIndex + 1}
                      </h3>
                      <div className="space-y-3">
                        {Array.from({ length: TEAMS_PER_ROUND }).map((_, pickIndex) => {
                          const globalIndex = (roundIndex * TEAMS_PER_ROUND) + pickIndex;
                          const teamId = editableDraftOrder[globalIndex];
                          
                          return (
                            <div key={globalIndex} className="flex flex-col space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Round {roundIndex + 1} – Pick {pickIndex + 1}
                              </label>
                              <select
                                value={teamId}
                                onChange={(e) => handleDraftOrderChange(globalIndex, e.target.value)}
                                className="p-2 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {teams.map(team => (
                                  <option key={team.id} value={team.id}>
                                    {team.name} ({team.owner})
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
