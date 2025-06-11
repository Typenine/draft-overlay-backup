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
      <AnimatePresence>
        {onClock && (
          <OnTheClockAnimation 
            team={onClock.team} 
            onComplete={() => onAnimationComplete('onClock')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimationLayer;
