import React from 'react';
import { AnimatePresence } from 'framer-motion';
import DraftAnimation from '../DraftAnimation/DraftAnimation';
import OnTheClockAnimation from '../OnTheClockAnimation/OnTheClockAnimation';
import styles from './AnimationLayer.module.css';

const AnimationLayer = ({ 
  animations: {
    draft: draftedPlayer,
    onClock,
    trade
  },
  onAnimationComplete,
  currentPickIndex
}) => {
  // Calculate pick index for onClock animation
  // If showing next team after draft, use next pick
  const onClockPickIndex = onClock?.isNextTeam ? currentPickIndex + 1 : currentPickIndex;
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
      <AnimatePresence>
        {onClock && (
          <OnTheClockAnimation 
            team={onClock.team}
            roundNumber={Math.floor(onClockPickIndex / 12) + 1}
            pickNumber={(onClockPickIndex % 12) + 1}
            onComplete={() => onAnimationComplete('onClock')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimationLayer;
