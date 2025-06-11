import React from 'react';
import { AnimatePresence } from 'framer-motion';
import DraftAnimation from '../DraftAnimation/DraftAnimation';
import styles from './AnimationLayer.module.css';

const AnimationLayer = ({ 
  animations: {
    draft: draftedPlayer,
    onClock,
    trade
  },
  onAnimationComplete
}) => {
  return (
    <div className={styles.animationLayer}>
      <AnimatePresence>
      {/* Draft Selection Animation */}
      {draftedPlayer && (
        <DraftAnimation
          player={draftedPlayer.player}
          team={draftedPlayer.team}
          onComplete={() => onAnimationComplete('draft')}
        />
      )}

      </AnimatePresence>
      {/* Future animations will be added here */}
      {/* Each animation will be wrapped in its own AnimatePresence */}
      {/* Example:
      <AnimatePresence>
        {onClockTeam && (
          <OnClockAnimation team={onClockTeam} onComplete={onClockAnimationComplete} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {tradeAlert && (
          <TradeAlertAnimation data={tradeAlert} onComplete={onTradeAlertComplete} />
        )}
      </AnimatePresence>
      */}
    </div>
  );
};

export default AnimationLayer;
